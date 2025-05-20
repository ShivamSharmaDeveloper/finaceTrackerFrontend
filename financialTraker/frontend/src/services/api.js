import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.retryCount = config.retryCount || 0;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Transform empty responses
        if (response.data === '') {
            return { ...response, data: { message: 'Operation successful' } };
        }
        // Handle paginated responses
        if (response.data && !response.data.results && Array.isArray(response.data)) {
            response.data = { results: response.data };
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.retryCount < MAX_RETRIES && 
            error.response?.status !== 401 && 
            error.response?.status !== 403) {
            
            originalRequest.retryCount += 1;
            await sleep(RETRY_DELAY * originalRequest.retryCount);
            return api(originalRequest);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            window.location.href = '/unauthorized';
        }

        error.userMessage = error.response?.data?.message 
            || error.response?.data?.detail
            || error.message
            || 'An unexpected error occurred';

        return Promise.reject(error);
    }
);

// Auth endpoints
const auth = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login/', credentials);
            if (!response.data.access) {
                throw new Error('No access token received from server');
            }
            return {
                ...response,
                data: {
                    token: response.data.access,
                    refreshToken: response.data.refresh,
                    user: response.data.user || null
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            if (error.response?.status === 401) {
                error.userMessage = 'Invalid username or password';
            }
            throw error;
        }
    },
    logout: () => api.post('/auth/logout/'),
    getCurrentUser: () => api.get('/auth/user/'),
    validateToken: () => api.get('/auth/validate-token/')
};

// Transaction endpoints
const transactions = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/transactions/', { params });
            return {
                ...response,
                data: {
                    results: response.data.results || [],
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return { data: { results: [], message: error.userMessage } };
        }
    },
    getById: (id) => api.get(`/transactions/${id}/`),
    create: (data) => api.post('/transactions/', data),
    update: (id, data) => api.put(`/transactions/${id}/`, data),
    delete: (id) => api.delete(`/transactions/${id}/`)
};

// Category endpoints
const categories = {
    getAll: async () => {
        try {
            const response = await api.get('/categories/');
            return {
                ...response,
                data: {
                    results: response.data.results || [],
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { data: { results: [], message: error.userMessage } };
        }
    },
    getById: (id) => api.get(`/categories/${id}/`),
    create: (data) => api.post('/categories/', data),
    update: (id, data) => api.put(`/categories/${id}/`, data),
    delete: (id) => api.delete(`/categories/${id}/`)
};

// Budget endpoints
const budgets = {
    getAll: async () => {
        try {
            const response = await api.get('/budgets/');
            return {
                ...response,
                data: {
                    results: response.data.results || [],
                    message: response.data.message
                }
            };
        } catch (error) {
            console.error('Error fetching budgets:', error);
            return { data: { results: [], message: error.userMessage } };
        }
    },
    getById: (id) => api.get(`/budgets/${id}/`),
    update: (id, data) => api.put(`/budgets/${id}/`, data),
    getSummary: () => api.get('/budgets/summary/'),
    getExpensesByCategory: () => api.get('/expenses/by-category/')
};

// Dashboard endpoints
const dashboard = {
    getSummary: () => api.get('/dashboard/')
};

export default {
    auth,
    transactions,
    categories,
    budgets,
    dashboard
}; 