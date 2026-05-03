"use client"

import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const stats = [
  { title: 'Total Revenue', value: '$45,231.89', subtitle: '+20.1% from last month', icon: <MonetizationOnIcon color="primary" /> },
  { title: 'Subscriptions', value: '+2350', subtitle: '+180.1% from last month', icon: <PeopleIcon color="primary" /> },
  { title: 'Sales', value: '+12,234', subtitle: '+19% from last month', icon: <PointOfSaleIcon color="primary" /> },
  { title: 'Active Now', value: '+573', subtitle: '+201 since last hour', icon: <ShowChartIcon color="primary" /> },
];

const recentSales = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00', init: 'OM' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00', init: 'JL' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00', init: 'IN' },
  { name: 'William Kim', email: 'will@email.com', amount: '+$99.00', init: 'WK' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00', init: 'SD' },
];

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ border: '1px solid #E2E4F0', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="600">
                    {stat.title}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="h5" component="div" fontWeight="700">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E4F0', borderRadius: 2, height: '100%', minHeight: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Overview
            </Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F2F8', borderRadius: 1, mt: 2 }}>
              <Typography color="text.secondary" variant="body2">Chart Placeholder</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E4F0', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Recent Sales
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              You made 265 sales this month.
            </Typography>
            <List disablePadding>
              {recentSales.map((sale, idx) => (
                <React.Fragment key={idx}>
                  <ListItem alignItems="flex-start" disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.875rem' }}>{sale.init}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="subtitle2" fontWeight="600" color="text.primary">{sale.name}</Typography>}
                      secondary={<Typography variant="body2" color="text.secondary" noWrap>{sale.email}</Typography>}
                    />
                    <Typography variant="subtitle2" fontWeight="600" sx={{ mt: 1, color: 'text.primary' }}>
                      {sale.amount}
                    </Typography>
                  </ListItem>
                  {idx < recentSales.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
