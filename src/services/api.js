import axios from 'axios';

// API configuration and interceptors
const api = axios.create({
    baseURL: process.env?.VUE_APP_API_URL || 'http://localhost:8000/api/',
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

api.interceptors.response.use(
    (response) => {
        if (response.data === '') {
            return { ...response, data: { message: 'Operation successful' } };
        }
        if (response.data && Array.isArray(response.data) && !Object.prototype.hasOwnProperty.call(response.data, 'results')) {
            response.data = { results: response.data };
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 1000;

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
            if (error.response?.status === 401) {
                error.userMessage = 'Invalid username or password';
            }
            throw error;
        }
    },
    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        return api.post('/auth/logout/', { refresh_token: refreshToken });
    },
    getCurrentUser: () => api.get('/auth/user/'),
    validateToken: (data) => api.post('/auth/validate-token/', data)
};

const transactions = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/transactions/', { 
                params,
                paramsSerializer: params => {
                    return Object.entries(params)
                        .filter(([, value]) => value !== undefined && value !== '')
                        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                        .join('&');
                }
            });
            return {
                ...response,
                data: {
                    results: response.data.results || [],
                    count: response.data.count || 0,
                    next: response.data.next,
                    previous: response.data.previous,
                    message: response.data.message
                }
            };
        } catch (error) {
            return { 
                data: { 
                    results: [], 
                    count: 0,
                    next: null,
                    previous: null,
                    message: error.userMessage 
                } 
            };
        }
    },
    getById: (id) => api.get(`/transactions/${id}/`),
    create: (data) => api.post('/transactions/', data),
    update: (id, data) => api.put(`/transactions/${id}/`, data),
    delete: (id) => api.delete(`/transactions/${id}/`),
    getMonthlyTrends: async () => {
        try {
            const response = await api.get('/transactions/monthly_trends/');
            return response.data.results;
        } catch (error) {
            return [];
        }
    }
};

const categories = {
    getAll: async () => {
        try {
            const response = await api.get('/categories/');
            return {
                ...response,
                data: {
                    results: response.data.results || [],
                    message: response.data.message,
                    can_initialize_defaults: response.data.can_initialize_defaults
                }
            };
        } catch (error) {
            return { data: { results: [], message: error.userMessage } };
        }
    },
    getById: (id) => api.get(`/categories/${id}/`),
    create: (data) => api.post('/categories/', data),
    update: (id, data) => api.put(`/categories/${id}/`, data),
    delete: (id) => api.delete(`/categories/${id}/`)
};

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
            return { data: { results: [], message: error.userMessage } };
        }
    },
    getById: (id) => api.get(`/budgets/${id}/`),
    create: (data) => api.post('/budgets/', data),
    update: (id, data) => api.put(`/budgets/${id}/`, data),
    getSummary: () => api.get('/budgets/summary/'),
    getExpensesByCategory: () => api.get('/expenses/by-category/')
};

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