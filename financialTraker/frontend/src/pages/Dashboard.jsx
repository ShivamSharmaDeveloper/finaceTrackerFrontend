import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import FinancialSummary from '../components/dashboard/FinancialSummary';
import MonthlyTrendsChart from '../components/dashboard/MonthlyTrendsChart';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import ExpensesByCategoryChart from '../components/dashboard/ExpensesByCategoryChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await api.get('transactions/');
                setTransactions(res.data);
                
                const income = res.data
                    .filter(t => t.category.type === 'income')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
                const expense = res.data
                    .filter(t => t.category.type === 'expense')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
                setTotalIncome(income);
                setTotalExpense(expense);
                setBalance(income - expense);
                setError(null);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            }
        };

        fetchTransactions();
    }, []);

    // Mock data for new components
    const mockMonthlyData = [
        { month: 'Jan', income: 5000, expenses: 3500 },
        { month: 'Feb', income: 5500, expenses: 3800 },
        { month: 'Mar', income: 4800, expenses: 3200 },
    ];

    const mockBudgetData = {
        budgeted: 5000,
        spent: 3500,
        remaining: 1500,
        categories: [
            { name: 'Food', budget: 1000, spent: 800 },
            { name: 'Transport', budget: 500, spent: 450 },
            { name: 'Entertainment', budget: 300, spent: 250 },
        ]
    };

    return (
        <Layout title="Dashboard">
            <Grid container spacing={3}>
                {/* Financial Summary */}
                <Grid item xs={12}>
                    <FinancialSummary 
                        data={{ 
                            totalIncome, 
                            totalExpenses: totalExpense, 
                            balance 
                        }} 
                    />
                </Grid>

                {/* Monthly Trends Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                        <MonthlyTrendsChart data={mockMonthlyData} />
                    </Paper>
                </Grid>

                {/* Expenses by Category */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
                        <ExpensesByCategoryChart data={transactions.filter(t => t.category.type === 'expense')} />
                    </Paper>
                </Grid>

                {/* Budget Overview */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Budget Overview</Typography>
                        <BudgetOverview data={mockBudgetData} />
                    </Paper>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                        {error ? (
                            <Typography variant="body1" color="error" align="center" sx={{ py: 4 }}>
                                {error}
                            </Typography>
                        ) : transactions.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No transactions yet
                            </Typography>
                        ) : (
                            <RecentTransactions transactions={transactions.slice(0, 5)} />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
};

export default Dashboard;
