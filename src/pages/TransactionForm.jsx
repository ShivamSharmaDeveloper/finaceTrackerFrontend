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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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
        const response = await api.categories.getAll();
        if (response.data.results) {
          setCategories(response.data.results);
          // If there are categories and no category is selected, select the first one
          if (response.data.results.length > 0 && !formData.category) {
            const firstMatchingCategory = response.data.results.find(
              cat => cat.type === formData.type
            );
            if (firstMatchingCategory) {
              setFormData(prev => ({
                ...prev,
                category: firstMatchingCategory.id
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        enqueueSnackbar('Failed to load categories', { variant: 'error' });
      }
    };

    const fetchTransaction = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.transactions.getById(id);
        setFormData({
          date: response.data.date,
          description: response.data.description,
          amount: response.data.amount,
          category: response.data.category,
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
  }, [id, enqueueSnackbar, formData.type, formData.category]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // If type changes, reset category if it doesn't match the new type
      if (name === 'type') {
        const currentCategory = categories.find(cat => cat.id === prev.category);
        if (currentCategory && currentCategory.type !== value) {
          newData.category = '';
          // Try to select the first category of the new type
          const firstMatchingCategory = categories.find(cat => cat.type === value);
          if (firstMatchingCategory) {
            newData.category = firstMatchingCategory.id;
          }
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.category) {
      enqueueSnackbar('Please select a category', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      if (id) {
        await api.transactions.update(id, formData);
        enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
      } else {
        await api.transactions.create(formData);
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

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Layout title={id ? 'Edit Transaction' : 'Add Transaction'}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Transaction' : 'Add New Transaction'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item size={{ xs: 12, md: 6 }}>
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

            <Grid item size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No {formData.type} categories available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
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

            <Grid item size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>

            <Grid item size={{ xs: 12, md: 12 }}>
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