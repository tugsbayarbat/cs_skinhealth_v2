"use client"

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('admin-login', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password, or you lack administrator access.');
      } else {
        router.push('/admin');
        router.refresh(); // Refresh state map capturing the active administrator session seamlessly bridging SSR layouts
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#F7F8FC' 
    }}>
      <Paper elevation={0} sx={{ 
        p: 5, 
        width: '100%', 
        maxWidth: 450, 
        borderRadius: 3, 
        border: '1px solid #E2E4F0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Box sx={{ 
          width: 56, 
          height: 56, 
          borderRadius: 2, 
          backgroundColor: '#6B35D9', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 3
        }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800 }}>S</Typography>
        </Box>
        
        <Typography variant="h5" component="h1" fontWeight="700" gutterBottom>
          Admin Portal
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Enter your administrator credentials to securely access the dashboard.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 4 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || !email || !password}
            sx={{ py: 1.5, fontSize: '1rem', textTransform: 'none', backgroundColor: '#6B35D9', '&:hover': { backgroundColor: '#5A2BB8' } }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
