import React from 'react';
import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BudgetOverview = ({ data }) => {
  const theme = useTheme();
  const { budgeted, spent, remaining, categories } = data;
  
  // Calculate percentage spent
  const percentSpent = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  
  // Determine color based on percentage spent
  const getColor = (percent) => {
    if (percent <= 60) return theme.palette.success.main;
    if (percent <= 85) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Budget Progress
              </Typography>
              <Typography variant="body2" fontWeight="medium" color={getColor(percentSpent)}>
                ${spent.toFixed(2)} of ${budgeted.toFixed(2)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentSpent, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: `${theme.palette.grey[200]}`,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: getColor(percentSpent),
                },
              }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                ${remaining.toFixed(2)} remaining
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {categories.map((category) => {
          const categoryPercent = category.budget > 0 
            ? (category.spent / category.budget) * 100 
            : 0;
            
          return (
            <Grid item xs={12} sm={6} md={4} key={category.name}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color={getColor(categoryPercent)}>
                    {categoryPercent.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(categoryPercent, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${theme.palette.grey[200]}`,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: getColor(categoryPercent),
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    ${category.spent.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${category.budget.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BudgetOverview;