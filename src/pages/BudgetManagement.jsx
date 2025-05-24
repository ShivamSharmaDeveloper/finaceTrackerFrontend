import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Layout from '../components/Layout';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import ExpensesByCategoryChart from '../components/dashboard/ExpensesByCategoryChart';
import api from '../services/api';

const BudgetManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editableBudgets, setEditableBudgets] = useState([]);
  const [error, setError] = useState(null);
  const [savingBudgets, setSavingBudgets] = useState(false);
  const [budgetData, setBudgetData] = useState({
    budgeted: 0,
    spent: 0,
    remaining: 0,
    categories: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await api.categories.getAll();
        const categoriesData = categoriesResponse.data.results.filter(cat => cat.type === 'expense');
        setCategories(categoriesData);

        const summaryResponse = await api.budgets.getSummary();
        setBudgetData(summaryResponse.data);

        const initialBudgets = categoriesData.map(category => {
          const existingBudget = summaryResponse.data.categories.find(
            b => b.name === category.name
          );

          return {
            id: category.id,
            category: category.id,
            category_name: category.name,
            amount: existingBudget ? existingBudget.budget : 0,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
          };
        });

        setBudgets(initialBudgets);
        setEditableBudgets(JSON.parse(JSON.stringify(initialBudgets)));
      } catch (err) {
        setError('Failed to load budget data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBudgetChange = (categoryId, newAmount) => {
    const updatedBudgets = editableBudgets.map(budget => {
      if (budget.category === categoryId) {
        return { ...budget, amount: newAmount };
      }
      return budget;
    });
    setEditableBudgets(updatedBudgets);
  };

  const handleEditClick = () => {
    setEditableBudgets(JSON.parse(JSON.stringify(budgets)));
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setEditableBudgets(JSON.parse(JSON.stringify(budgets)));
  };

  const handleSaveClick = async () => {
    try {
      setSavingBudgets(true);

      for (const budget of editableBudgets) {
        if (budget.amount > 0) {
          await api.budgets.create({
            category: budget.category,
            amount: budget.amount,
            start_date: budget.start_date,
            end_date: budget.end_date
          });
        }
      }

      const summaryResponse = await api.budgets.getSummary();
      setBudgetData(summaryResponse.data);
      setBudgets(editableBudgets);
      setEditMode(false);
      enqueueSnackbar('Budgets updated successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to update budgets', { variant: 'error' });
    } finally {
      setSavingBudgets(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Budget Management">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Budget Management">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Budget Management">
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight="500">
          Budget Management
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Set your monthly budget limits for each category and track your spending.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Monthly Budget Overview</Typography>
            </Box>
            <BudgetOverview data={budgetData} />
          </Paper>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Current Month Expenses
            </Typography>
            <ExpensesByCategoryChart data={budgetData} height={500} />
          </Paper>
        </Grid>

        <Grid item size={{ xs: 12, md: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" flexDirection="column">
                <Typography variant="h6" gutterBottom>
                  Budget Allocation
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Set your monthly budget limit for each spending category.
                </Typography>
              </Box>

              {!editMode ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                >
                  Edit Budgets
                </Button>
              ) : (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelClick}
                    sx={{ mr: 1 }}
                    disabled={savingBudgets}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveClick}
                    disabled={savingBudgets}
                  >
                    {savingBudgets ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                </Box>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Monthly Budget</TableCell>
                    <TableCell align="right">Spent This Month</TableCell>
                    <TableCell align="right">Remaining</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => {
                    const budget = editMode
                      ? editableBudgets.find(b => b.category === category.id)
                      : budgets.find(b => b.category === category.id);

                    const budgetAmount = budget ? budget.amount : 0;
                    const categorySummary = budgetData.categories.find(
                      c => c.name === category.name
                    ) || { spent: 0, budget: budgetAmount };

                    const spent = categorySummary.spent;
                    const remaining = budgetAmount - spent;
                    const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                    let statusColor = 'success.main';
                    if (percentUsed > 85) statusColor = 'error.main';
                    else if (percentUsed > 60) statusColor = 'warning.main';

                    return (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell align="right">
                          {editMode ? (
                            <TextField
                              type="number"
                              size="small"
                              InputProps={{
                                startAdornment: <Typography variant="body2">₹</Typography>
                              }}
                              value={budgetAmount}
                              onChange={(e) => handleBudgetChange(
                                category.id,
                                Math.max(0, parseFloat(e.target.value) || 0)
                              )}
                              sx={{ width: 120 }}
                            />
                          ) : (
                            <Typography>₹{budgetAmount.toFixed(2)}</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography>₹{spent.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            color={remaining >= 0 ? 'success.main' : 'error.main'}
                            fontWeight="medium"
                          >
                            ₹{remaining.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ width: 200 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(percentUsed, 100)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: statusColor,
                                  }
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {percentUsed.toFixed(0)}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item size={{ xs: 12, md: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Budgeting Tips
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    50/30/20 Rule
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
                  </Typography>
                </Box>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Track Every Expense
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Consistently recording all transactions helps identify spending patterns and opportunities to save.
                  </Typography>
                </Box>
              </Grid>

              <Grid item size={{ xs: 12, md: 4 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Review & Adjust
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regularly review your budget and adjust category allocations based on your changing needs and priorities.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default BudgetManagement;