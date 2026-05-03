"use client"

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, CircularProgress, 
  List, ListItem, ListItemText, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert, ListItemAvatar, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MemoryIcon from '@mui/icons-material/Memory';
import AddIcon from '@mui/icons-material/Add';

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formToken, setFormToken] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/models');
      const data = await res.json();
      if (data.ok) setModels(data.models);
    } catch (err) {
      showSnackbar('Failed to load models', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormName('');
    setFormUrl('');
    setFormToken('');
  };

  const handleSave = async () => {
    if (!formName || !formUrl) {
      showSnackbar('Name and URL are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, url: formUrl, access_token: formToken }),
      });
      const data = await res.json();
      if (data.ok) {
        showSnackbar('Model added successfully!', 'success');
        setModels([data.model, ...models]);
        handleCloseDialog();
      } else {
        showSnackbar(data.error || 'Failed to add model', 'error');
      }
    } catch (err) {
      showSnackbar('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    
    try {
      const res = await fetch(`/api/admin/models/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setModels(models.filter(m => m.id !== id));
        showSnackbar('Model deleted', 'success');
      } else {
        showSnackbar(data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      showSnackbar('Network error', 'error');
    }
  };

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          AI Models
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} sx={{ textTransform: 'none', borderRadius: 2 }}>
          Add Model
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #E2E4F0', borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : models.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No AI models configured yet.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {models.map((model, idx) => (
              <React.Fragment key={model.id}>
                <ListItem 
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(model.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{ p: 2.5 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(107, 53, 217, 0.1)', color: '#6B35D9' }}>
                      <MemoryIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1" fontWeight="600">{model.name}</Typography>}
                    secondary={<Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{model.url}</Typography>}
                  />
                </ListItem>
                {idx < models.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Add Model Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Add AI Model</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <TextField
            autoFocus
            label="Provider / Model Name"
            fullWidth
            variant="outlined"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. OpenAI GPT-4, Local Llama3"
          />
          <TextField
            label="Endpoint URL"
            fullWidth
            variant="outlined"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            placeholder="https://api.openai.com/v1/chat/completions"
          />
          <TextField
            label="Access Token (Optional)"
            type="password"
            fullWidth
            variant="outlined"
            value={formToken}
            onChange={(e) => setFormToken(e.target.value)}
            placeholder="sk-..."
            helperText="Stored securely in the database"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {saving ? 'Adding...' : 'Add Model'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
