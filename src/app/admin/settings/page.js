"use client"

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export default function SettingsPage() {
  const [modelUrl, setModelUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setModelUrl(data.settings.ai_model_url || '');
          setAccessToken(data.settings.ai_access_token || '');
        }
      })
      .catch(err => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_model_url: modelUrl, ai_access_token: accessToken }),
      });
      const data = await res.json();
      if (data.ok) {
        setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.error || 'Failed to save', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Network error', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        System Settings
      </Typography>

      <Paper elevation={0} sx={{ p: 4, border: '1px solid #E2E4F0', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
          AI Model Configuration
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="AI Model URL"
              variant="outlined"
              fullWidth
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              helperText="The REST endpoint mapped to the AI inference engine."
            />
            <TextField
              label="Access Token"
              variant="outlined"
              type="password"
              fullWidth
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="sk-..."
              helperText="Provide the secure access key. This is stored securely in the database."
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleSave} 
                disabled={saving}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 4 }}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
