import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Layout from '../components/Layout';
import api from '../services/api';

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    type: 'expense'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        enqueueSnackbar('Failed to load categories', { variant: 'error' });
      }
    };

    const fetchTransaction = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/transactions/${id}/`);
        setFormData({
          date: response.data.date,
          description: response.data.description,
          amount: response.data.amount,
          category: response.data.category.id,
          type: response.data.type
        });
      } catch (error) {
        console.error('Error fetching transaction:', error);
        enqueueSnackbar('Failed to load transaction', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchTransaction();
  }, [id, enqueueSnackbar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await api.put(`/transactions/${id}/`, formData);
        enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
      } else {
        await api.post('/transactions/', formData);
        enqueueSnackbar('Transaction created successfully', { variant: 'success' });
      }
      navigate('/transactions');
    } catch (error) {
      console.error('Error saving transaction:', error);
      enqueueSnackbar('Failed to save transaction', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Layout title={id ? 'Edit Transaction' : 'Add Transaction'}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={id ? 'Edit Transaction' : 'Add Transaction'}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/transactions')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Layout>
  );
};

export default TransactionForm;