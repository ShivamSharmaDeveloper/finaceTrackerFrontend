import React from 'react';
import { List, ListItem, ListItemText, Divider, Box, Typography, Chip } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const RecentTransactions = ({ transactions }) => {
  const theme = useTheme();

  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No recent transactions found.
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {transactions.map((transaction, index) => (
        <React.Fragment key={transaction.id}>
          <ListItem
            alignItems="flex-start"
            disablePadding
            sx={{ py: 1 }}
          >
            <Box
              sx={{
                mr: 2,
                bgcolor: transaction.type === 'income' 
                  ? `${theme.palette.success.main}15` 
                  : `${theme.palette.error.main}15`,
                color: transaction.type === 'income' 
                  ? theme.palette.success.main 
                  : theme.palette.error.main,
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {transaction.type === 'income' ? <ArrowUpward /> : <ArrowDownward />}
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={transaction.description}
                  secondary={format(new Date(transaction.date), 'MMM dd, yyyy')}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                  sx={{ my: 0 }}
                />
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  label={transaction.category} 
                  size="small" 
                  sx={{ 
                    height: 24, 
                    fontSize: '0.75rem',
                    bgcolor: theme.palette.grey[100]
                  }} 
                />
              </Box>
            </Box>
          </ListItem>
          {index < transactions.length - 1 && (
            <Divider component="li" sx={{ my: 1 }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentTransactions;