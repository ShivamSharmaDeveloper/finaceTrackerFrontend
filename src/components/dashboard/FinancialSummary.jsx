import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SummaryCard = ({ title, amount, icon, color, secondaryText }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        borderRadius: '30px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="medium">
            ₹{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          {secondaryText && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {secondaryText}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const FinancialSummary = ({ data }) => {
  const theme = useTheme();
  const { totalIncome, totalExpenses, balance } = data;

  // Calculate this month's savings rate if data is available
  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)
    : 0;

  return (
    <Grid container spacing={3}>
      <Grid item size={{ xs: 12, md: 4 }}>
        <SummaryCard
          title="Total Income"
          amount={totalIncome}
          icon={<TrendingUp sx={{ color: theme.palette.success.main, fontSize: 28 }} />}
          color={theme.palette.success.main}
          secondaryText="Total income for this month"
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 4 }}>
        <SummaryCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={<TrendingDown sx={{ color: theme.palette.error.main, fontSize: 28 }} />}
          color={theme.palette.error.main}
          secondaryText="Total expenses for this month"
        />
      </Grid>

      <Grid item size={{ xs: 12, md: 4 }}>
        <SummaryCard
          title="Balance"
          amount={balance}
          icon={<AccountBalance sx={{ color: theme.palette.primary.main, fontSize: 28 }} />}
          color={theme.palette.primary.main}
          secondaryText={`Savings rate: ${savingsRate}%`}
        />
      </Grid>
    </Grid>
  );
};

export default FinancialSummary;