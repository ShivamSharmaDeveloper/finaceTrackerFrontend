import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
    setLoading(true);
        try {
      await login(formData);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false);
        }
    };

    return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="500">
              Budget Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Sign in to manage your finances
                </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
                        margin="normal"
                        required
              autoFocus
                    />

                    <TextField
                        fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
                        margin="normal"
                        required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Demo Credentials:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Username: demo / Password: demo123
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
    );
};

export default Login;
