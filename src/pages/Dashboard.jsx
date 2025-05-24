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
    const [budgetData, setBudgetData] = useState({
        budgeted: 0,
        spent: 0,
        remaining: 0,
        categories: []
    });
    const [monthlyTrends, setMonthlyTrends] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch transactions
                const transactionsResponse = await api.transactions.getAll();
                const transactionData = transactionsResponse.data.results || [];
                setTransactions(transactionData);

                // Calculate totals
                const income = transactionData
                    .filter(t => t?.type === 'income')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

                const expense = transactionData
                    .filter(t => t?.type === 'expense')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

                setTotalIncome(income);
                setTotalExpense(expense);
                setBalance(income - expense);

                // Fetch budgets
                const budgetsResponse = await api.budgets.getSummary();
                if (budgetsResponse.data) {
                    setBudgetData(budgetsResponse.data);
                }

                // Fetch monthly trends
                const trendsData = await api.transactions.getMonthlyTrends();
                setMonthlyTrends(trendsData);

                setError(null);
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <Layout title="Dashboard">
            <Grid container spacing={3}>
                {/* Financial Summary */}
                <Grid item xs={12} width="100%">
                    <FinancialSummary
                        data={{
                            totalIncome,
                            totalExpenses: totalExpense,
                            balance
                        }}
                    />
                </Grid>

                {/* Monthly Trends Chart */}
                <Grid item xs={12} md={8} width="100%">
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                        <MonthlyTrendsChart data={monthlyTrends} />
                    </Paper>
                </Grid>

                {/* Expenses by Category */}
                <Grid item xs={12} md={4} width="100%">
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
                        <ExpensesByCategoryChart data={transactions.filter(t => t?.type === 'expense')} height={300} />
                    </Paper>
                </Grid>

                {/* Budget Overview */}
                <Grid item xs={12} md={6} width="100%">
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Budget Overview</Typography>
                        <BudgetOverview data={budgetData} />
                    </Paper>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12} md={6} width="100%">
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
