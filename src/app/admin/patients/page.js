"use client";

import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Switch, CircularProgress,
    Alert, Chip
} from '@mui/material';

export default function AdminPatientsPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/patients');
            if (!res.ok) throw new Error('Failed to fetch users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleApproval = async (id, currentStatus) => {
        // Optimistic UI update
        const newStatus = !currentStatus;
        setUsers(users.map(u => u.id === id ? { ...u, is_approved: newStatus } : u));

        try {
            const res = await fetch('/api/admin/patients', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_approved: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update approval status');
        } catch (err) {
            // Revert on error
            setUsers(users.map(u => u.id === id ? { ...u, is_approved: currentStatus } : u));
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
                Patients & Users
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E4F0', borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="users table">
                    <TableHead sx={{ backgroundColor: '#F8F9FA' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Approved</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {user.email}
                                </TableCell>
                                <TableCell>{user.name || '-'}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.role} 
                                        size="small" 
                                        color={user.role === 'admin' ? 'primary' : 'default'} 
                                        variant="outlined" 
                                    />
                                </TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.is_approved ? 'Approved' : 'Waitlist'} 
                                        size="small" 
                                        color={user.is_approved ? 'success' : 'warning'} 
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Switch
                                        checked={user.is_approved}
                                        onChange={() => toggleApproval(user.id, user.is_approved)}
                                        color="primary"
                                        disabled={user.role === 'admin'} // Prevent accidentally disabling an admin
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
