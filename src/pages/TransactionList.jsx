import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Pagination,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const TransactionList = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  // console.log(transactions, 'transactions')

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const fetchCategories = async () => {
    try {
      const response = await api.categories.getAll();
      if (response.data.results) {
        setCategories(response.data.results);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = {
          page: page + 1,
          page_size: rowsPerPage
        };
        
        if (filters.search) params.search = filters.search;
        if (filters.type) params.type = filters.type;
        if (filters.category) params.category = filters.category;
        if (filters.startDate) params.start_date = filters.startDate;
        if (filters.endDate) params.end_date = filters.endDate;
        if (filters.minAmount) params.min_amount = filters.minAmount;
        if (filters.maxAmount) params.max_amount = filters.maxAmount;
        
        const response = await api.transactions.getAll(params);
        if (response.data) {
          setTransactions(response.data.results || []);
          setTotalCount(response.data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        enqueueSnackbar('Failed to load transactions', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    fetchCategories();
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(0); // Reset to first page when filters change
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      await api.transactions.delete(transactionToDelete.id);
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      enqueueSnackbar('Transaction deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      enqueueSnackbar('Failed to delete transaction', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout title="Transactions">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/transactions/add')}
        >
          Add Transaction
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box 
          component="form" 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2 
          }}
        >
          <TextField
            label="Search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            placeholder="Search description..."
          />
          
          <FormControl size="small">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categories.length > 0 && categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <TextField
            label="Min Amount"
            name="minAmount"
            type="number"
            placeholder='Min Amount'
            value={filters.minAmount}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            size="small"
          />
          
          <TextField
            label="Max Amount"
            placeholder='Max Amount'
            name="maxAmount"
            type="number"
            value={filters.maxAmount}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            size="small"
          />
        </Box>
      </Paper>
      
      <Paper elevation={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.category_name ? (
                            <Chip 
                              label={transaction.category_name} 
                              size="small" 
                              sx={{ borderRadius: 1 }} 
                            />
                          ) : (
                            <Chip 
                              label="Uncategorized" 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1 }} 
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.type} 
                            color={transaction.type === 'income' ? 'success' : 'error'} 
                            size="small" 
                            variant="outlined"
                            sx={{ borderRadius: 1 }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteClick(transaction)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No transactions found. Adjust your filters or add a new transaction.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {totalCount > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TransactionList;