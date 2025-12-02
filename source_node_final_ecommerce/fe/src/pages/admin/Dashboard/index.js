import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics,
  TrendingUp,
  BarChart
} from '@mui/icons-material';
import { getSimpleDashboard, getAdvancedDashboard } from '../../../redux/reducers/dashboardSlice';
import SimpleDashboard from './SimpleDashboard';
import AdvancedDashboard from './AdvancedDashboard';

function Dashboard() {
  const dispatch = useDispatch();
  const { simpleDashboard, advancedDashboard, loading, error } = useSelector(state => state.dashboard);
  
  const [activeTab, setActiveTab] = useState(0);

  // ✅ Memoize onFilterChange để tránh re-render
  const handleFilterChange = useCallback((params) => {
    dispatch(getAdvancedDashboard(params));
  }, [dispatch]);

  // ✅ Chỉ load data khi tab thay đổi
  useEffect(() => {
    if (activeTab === 0) {
      dispatch(getSimpleDashboard());
    } else {
      // Load với default params cho advanced dashboard
      dispatch(getAdvancedDashboard({
        timeframe: 'year',
        year: new Date().getFullYear()
      }));
    }
  }, [dispatch, activeTab]); // ← Chỉ depend vào activeTab

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading && !simpleDashboard && !advancedDashboard) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard Quản Trị
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng quan hiệu suất và thống kê chi tiết của cửa hàng
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600
              }
            }}
          >
            <Tab 
              icon={<TrendingUp />} 
              label="Tổng Quan" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab 
              icon={<Analytics />} 
              label="Chuyên Sâu" 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </Card>

        {/* Dashboard Content */}
        {activeTab === 0 && (
          <SimpleDashboard 
            data={simpleDashboard} 
            loading={loading}
            onRefresh={() => dispatch(getSimpleDashboard())}
          />
        )}
        
        {activeTab === 1 && (
          <AdvancedDashboard 
            data={advancedDashboard} 
            loading={loading}
            onFilterChange={handleFilterChange}
          />
        )}
      </Box>
    </Fade>
  );
}

export default Dashboard;