import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Alert,
  Paper,
  Fade,
  Tooltip,
  useTheme,
  alpha,
  Tab,
  Tabs,
  ButtonGroup,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CompareArrows,
  FilterList,
  Analytics,
  ShoppingCart,
  AttachMoney,
  Assessment,
  Category,
  Inventory,
  ShowChart,
  Timeline,
  Download,
  Refresh,
  MoreVert,
  Store,
  MonetizationOn,
  Speed,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Insights,
  Dashboard as DashboardIcon,
  TrendingFlat,
  ExpandMore,
  Visibility,
  GetApp,
  Settings,
  TableChart,
  DonutLarge
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  LineChart,
  BarChart,
  PieChart,
  SparkLineChart,
  Gauge
} from '@mui/x-charts';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const AdvancedDashboard = ({ data, loading, onFilterChange }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    timeframe: 'year',
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    month: new Date().getMonth(),
    start_date: null,
    end_date: null
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [activeTab, setActiveTab] = useState(0);
  const [showComparison, setShowComparison] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'compact'

  useEffect(() => {
    if (isInitialized) {
      const timeoutId = setTimeout(() => {
        onFilterChange({
          ...filters,
          start_date: filters.start_date?.format('YYYY-MM-DD') || '',
          end_date: filters.end_date?.format('YYYY-MM-DD') || ''
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setIsInitialized(true);
    }
  }, [filters, onFilterChange, isInitialized]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatCompactNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  const formatGrowthIndicator = (percentage, label) => {
    const isPositive = percentage > 0;
    const isNegative = percentage < 0;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5, 
        borderRadius: 3,
        bgcolor: alpha(isPositive ? theme.palette.success.main : isNegative ? theme.palette.error.main : theme.palette.grey[500], 0.1),
        border: `1px solid ${alpha(isPositive ? theme.palette.success.main : isNegative ? theme.palette.error.main : theme.palette.grey[500], 0.2)}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease'
      }}>
        <Avatar sx={{ 
          bgcolor: alpha(isPositive ? theme.palette.success.main : isNegative ? theme.palette.error.main : theme.palette.grey[500], 0.2),
          width: 32,
          height: 32,
          mr: 1
        }}>
          {isPositive ? (
            <TrendingUp sx={{ color: 'common.white', fontSize: 18 }} />
          ) : isNegative ? (
            <TrendingDown sx={{ color: 'common.white', fontSize: 18 }} />
          ) : (
            <TrendingFlat sx={{ color: 'common.white', fontSize: 18 }} />
          )}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={700} color={isPositive ? 'common.white' : isNegative ? 'common.white' : 'common.white'}>
            {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
          </Typography>
          <Typography variant="caption" color="common.white">
            {label}
          </Typography>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Fade in>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
        }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
            <CircularProgress 
              size={80} 
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
                animationDuration: '1.5s'
              }}
            />
            <Box sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Analytics sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
            🔍 Đang phân tích dữ liệu kinh doanh
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
            Hệ thống đang xử lý và phân tích dữ liệu để tạo ra báo cáo chi tiết nhất
          </Typography>
        </Box>
      </Fade>
    );
  }

  if (!data) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.8)} 0%, ${alpha(theme.palette.grey[50], 0.9)} 100%)`,
        borderRadius: 4,
        border: `1px dashed ${theme.palette.grey[300]}`
      }}>
        <Analytics sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h4" fontWeight={700} color="text.secondary" gutterBottom>
          📊 Không có dữ liệu để phân tích
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Hãy điều chỉnh bộ lọc thời gian hoặc kiểm tra dữ liệu hệ thống
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={() => onFilterChange(filters)}
          size="large"
          sx={{ borderRadius: 3 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  const { analytics } = data;

  // Prepare chart data with safety checks
  const salesChartData = analytics?.sales?.map(item => ({
    time: item._id || 'N/A',
    orders: item.orderCount || 0,
    revenue: item.revenue || 0,
    profit: item.profit || 0,
    avgOrderValue: item.avgOrderValue || 0
  })) || [];

  const topProductsColumns = [
    {
      field: 'rank',
      headerName: '🏆 Hạng',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Chip
            label={`#${params.value}`}
            size="small"
            color={params.value <= 3 ? 'warning' : 'default'}
            variant={params.value <= 3 ? 'filled' : 'outlined'}
          />
        </Box>
      )
    },
    {
      field: 'name',
      headerName: '🛍️ Sản phẩm',
      align: 'center',
      headerAlign: 'center',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', py: 0.5 }}>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {params.row.id}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'totalQuantity',
      headerName: '📦 Đã bán',
      align: 'center',
      headerAlign: 'center',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Chip
            label={`${params.value} SP`}
            size="small"
            color="info"
            variant="outlined"
          />
        </Box>
      )
    },
    {
      field: 'totalRevenue',
      headerName: '💰 Doanh thu',
      width: 180,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formatCurrency(params.value)}
          </Typography>
        </Box>
      )
    },
    {
      field: 'avgPrice',
      headerName: '📊 Giá TB',
      width: 140,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(params.value)}
          </Typography>
        </Box>
      )
    }
  ];

  const topProductsRows = analytics?.topProducts?.map((product, index) => ({
    id: product._id,
    rank: index + 1,
    name: product.name,
    totalQuantity: product.totalQuantity,
    totalRevenue: product.totalRevenue,
    avgPrice: product.avgPrice
  })) || [];

  const categoryPieData = analytics?.topCategories?.map((category, index) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main
    ];
    
    return {
      id: category._id,
      value: category.revenue || 0,
      label: category.name || 'Unknown'
    };
  }) || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        {/* Enhanced Header with Actions */}
        <Card sx={{ 
          mb: 4, 
          borderRadius: 4, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 3, 
                  width: 64, 
                  height: 64,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                }}>
                  <DashboardIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                    📊 Analytics Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Phân tích chi tiết hiệu suất kinh doanh và xu hướng thị trường
                  </Typography>
                </Box>
              </Box>
              
              
            </Box>

            {/* Enhanced Filters in Accordion */}
            <Accordion sx={{ borderRadius: 3, mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="filter-content"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 3,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterList sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    🎯 Bộ lọc thời gian 
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3} alignItems="flex-end">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>⏰ Khoảng thời gian</InputLabel>
                      <Select
                        value={filters.timeframe}
                        onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                        label="⏰ Khoảng thời gian"
                      >
                        <MenuItem value="year">📅 Theo năm</MenuItem>
                        <MenuItem value="quarter">📊 Theo quý</MenuItem>
                        <MenuItem value="month">📆 Theo tháng</MenuItem>
                        <MenuItem value="week">🗓️ Theo tuần</MenuItem>
                        <MenuItem value="custom">⚙️ Tùy chỉnh</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {filters.timeframe !== 'week' && filters.timeframe !== 'custom' && (
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="📅 Năm"
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                        inputProps={{ min: 2020, max: new Date().getFullYear() + 1 }}
                        variant="outlined"
                      />
                    </Grid>
                  )}

                  {filters.timeframe === 'quarter' && (
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>📊 Quý</InputLabel>
                        <Select
                          value={filters.quarter}
                          onChange={(e) => handleFilterChange('quarter', e.target.value)}
                          label="📊 Quý"
                        >
                          <MenuItem value={1}>Q1 (T1-T3)</MenuItem>
                          <MenuItem value={2}>Q2 (T4-T6)</MenuItem>
                          <MenuItem value={3}>Q3 (T7-T9)</MenuItem>
                          <MenuItem value={4}>Q4 (T10-T12)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {filters.timeframe === 'month' && (
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth>
                        <InputLabel>📆 Tháng</InputLabel>
                        <Select
                          value={filters.month}
                          onChange={(e) => handleFilterChange('month', e.target.value)}
                          label="📆 Tháng"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i} value={i}>
                              Tháng {i + 1}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {filters.timeframe === 'custom' && (
                    <>
                      <Grid item xs={12} sm={6} md={2}>
                        <DatePicker
                          label="📅 Từ ngày"
                          value={filters.start_date}
                          onChange={(newValue) => handleFilterChange('start_date', newValue)}
                          slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <DatePicker
                          label="📅 Đến ngày"
                          value={filters.end_date}
                          onChange={(newValue) => handleFilterChange('end_date', newValue)}
                          slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={1}>
                      
                      <Tooltip title="Làm mới dữ liệu">
                        <IconButton 
                          color="primary" 
                          onClick={() => onFilterChange({
                            ...filters,
                            start_date: filters.start_date?.format('YYYY-MM-DD') || '',
                            end_date: filters.end_date?.format('YYYY-MM-DD') || ''
                          })}
                          sx={{ 
                            borderRadius: 2,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Enhanced KPI Cards with Advanced Design */}
        {analytics?.comparison && (
          <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 4, 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '250px',
                minWidth: '400px',
                height: '100%',
                width: '100%',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateZ(0)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.5)}`
                }
              }}>
                {/* Background Decoration */}
                <Box sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }} />
                <Box sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)'
                }} />
                
                <CardContent sx={{ height: '100%',width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1, position: 'relative', p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      mr: 2, 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                      <ShoppingCart fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Tổng đơn hàng
                      </Typography>
                      
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {(analytics.comparison.current.orders || 0).toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ mt: 3  }}>
                    {formatGrowthIndicator(analytics.comparison.growth.orders || 0, 'so với kỳ trước')}
                  </Box>
                  
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Kỳ trước: <strong>{(analytics.comparison.previous.orders || 0).toLocaleString()}</strong> đơn
                    </Typography>
                  </Box>

                  {/* Gauge Chart */}
                  {analytics.comparison.current.orders > 0 && (
                    <Box sx={{ mt: 2, height: 60 }}>
                      <Gauge
                        width={200}
                        height={60}
                        value={Math.min((analytics.comparison.current.orders / 1000) * 100, 100)}
                        valueMin={0}
                        valueMax={100}
                        cornerRadius="50%"
                        sx={{ 
                          [`& .MuiGauge-valueText`]: { 
                            fontSize: 12,
                            fill: 'white'
                          },
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 4, 
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '250px',
                minWidth: '400px',
                height: '100%',
                width: '100%',
                boxShadow: `0 12px 40px ${alpha(theme.palette.success.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.success.main, 0.5)}`
                }
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)'
                }} />
                
                <CardContent sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1, position: 'relative', p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      mr: 2, 
                      width: 56, 
                      height: 56 
                    }}>
                      <MonetizationOn fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Tổng doanh thu
                      </Typography>
                      
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {formatCurrency(analytics.comparison.current.revenue)}
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    {formatGrowthIndicator(analytics.comparison.growth.revenue || 0, 'tăng trưởng')}
                  </Box>
                  
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Kỳ trước: <strong>{formatCurrency(analytics.comparison.previous.revenue)}</strong>
                    </Typography>
                  </Box>

                  {/* Mini Sparkline */}
                  {salesChartData.length > 0 && (
                    <Box sx={{ mt: 2, height: 60 }}>
                      <SparkLineChart
                        data={salesChartData.map(d => d.revenue)}
                        height={60}
                        colors={['rgba(255,255,255,0.9)']}
                        area
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 4, 
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '250px',
                minWidth: '400px',
                height: '100%',
                width: '100%',
                boxShadow: `0 12px 40px ${alpha(theme.palette.info.main, 0.4)}`,
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: `0 20px 60px ${alpha(theme.palette.info.main, 0.5)}`
                }
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)'
                }} />
                
                <CardContent sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1, position: 'relative', p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      mr: 2, 
                      width: 56, 
                      height: 56 
                    }}>
                      <Assessment fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Giá trị TB/Đơn
                      </Typography>
                      
                    </Box>
                  </Box>
                  
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    {formatCurrency(analytics.comparison.current.avgOrderValue)}
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    {formatGrowthIndicator(analytics.comparison.growth.avgOrderValue || 0, 'thay đổi')}
                  </Box>
                  
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Kỳ trước: <strong>{formatCurrency(analytics.comparison.previous.avgOrderValue)}</strong>
                    </Typography>
                  </Box>

                  {/* Progress Indicator */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Mục tiêu tháng
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        85%
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: '85%', 
                        height: '100%', 
                        bgcolor: 'rgba(255,255,255,0.8)',
                        borderRadius: 1 
                      }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Enhanced Chart Section with Tabs */}
        <Card sx={{ mb: 4, borderRadius: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ px: 3 }}
            >
              <Tab 
                icon={<TimelineIcon />} 
                label="📈 Xu hướng doanh số" 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                icon={<BarChartIcon />} 
                label="📊 So sánh kỳ" 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              
            </Tabs>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            {/* Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 48, height: 48 }}>
                      <TimelineIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        📈 Biểu đồ xu hướng kinh doanh
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phân tích xu hướng doanh số, doanh thu theo thời gian
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <ButtonGroup variant="outlined" size="small">
                      <Button 
                        startIcon={<ShowChart />}
                        onClick={() => setChartType('line')}
                        variant={chartType === 'line' ? 'contained' : 'outlined'}
                      >
                        Biểu đồ đường
                      </Button>
                      <Button 
                        startIcon={<BarChartIcon />}
                        onClick={() => setChartType('bar')}
                        variant={chartType === 'bar' ? 'contained' : 'outlined'}
                      >
                        Biểu đồ cột
                      </Button>
                    </ButtonGroup>
                    
                  </Stack>
                </Box>
                
                {salesChartData.length > 0 ? (
                  <Box sx={{ height: 450 }}>
                    {chartType === 'line' && (
                      <LineChart
                        xAxis={[{ 
                          scaleType: 'point', 
                          data: salesChartData.map(item => item.time),
                          tick: { fontSize: 12 }
                        }]}
                        series={[
                          {
                            data: salesChartData.map(item => item.orders),
                            label: '📦 Số đơn hàng',
                            color: theme.palette.primary.main,
                            curve: 'linear'
                          },
                          {
                            data: salesChartData.map(item => item.revenue / 1000),
                            label: '💰 Doanh thu (K₫)',
                            color: theme.palette.success.main,
                            curve: 'linear'
                          }
                        ]}
                        height={450}
                        margin={{ left: 100, right: 100, top: 40, bottom: 80 }}
                        grid={{ horizontal: true, vertical: true }}
                      />
                    )}
                    
                    {chartType === 'bar' && (
                      <BarChart
                        xAxis={[{ 
                          scaleType: 'band', 
                          data: salesChartData.map(item => item.time)
                        }]}
                        series={[
                          {
                            data: salesChartData.map(item => item.orders),
                            label: '📦 Đơn hàng',
                            color: theme.palette.primary.main
                          },
                          {
                            data: salesChartData.map(item => item.revenue / 1000),
                            label: '💰 Doanh thu (K₫)',
                            color: theme.palette.success.main
                          }
                        ]}
                        height={450}
                        margin={{ left: 100, right: 100, top: 40, bottom: 80 }}
                      />
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" icon={<Analytics />} sx={{ borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>📊 Chưa có dữ liệu biểu đồ</Typography>
                    <Typography>Hãy thử chọn khoảng thời gian khác hoặc kiểm tra dữ liệu đơn hàng.</Typography>
                  </Alert>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  📊 So sánh doanh thu và lợi nhuận
                </Typography>
                {salesChartData.length > 0 ? (
                  <Box sx={{ height: 400 }}>
                    <BarChart
                      xAxis={[{ 
                        scaleType: 'band', 
                        data: salesChartData.map(item => item.time)
                      }]}
                      series={[
                        {
                          data: salesChartData.map(item => item.revenue),
                          label: '💰 Doanh thu',
                          color: theme.palette.success.main
                        },
                        {
                          data: salesChartData.map(item => item.profit),
                          label: '📈 Lợi nhuận',
                          color: theme.palette.warning.main
                        }
                      ]}
                      height={400}
                      margin={{ left: 100, right: 100, top: 40, bottom: 80 }}
                    />
                  </Box>
                ) : (
                  <Alert severity="warning">Không có dữ liệu so sánh</Alert>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  🎯 Phân tích chi tiết theo sản phẩm
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" gutterBottom>Top sản phẩm theo doanh thu</Typography>
                    {/* Additional analytics content */}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>Thống kê nhanh</Typography>
                    {/* Quick stats */}
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Product and Category Analytics */}
        <Grid container spacing={4}>
          {/* Top Products with Enhanced DataGrid */}
          <Grid item xs={12} lg={8} width="850px">
            <Card sx={{ height: 700, borderRadius: 4 }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 48, height: 48 }}>
                      <Inventory />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        🏆 Bảng xếp hạng sản phẩm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Top sản phẩm bán chạy theo doanh thu
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    
                    
                  </Stack>
                </Box>
                
                {topProductsRows.length > 0 ? (
                  <Box sx={{ height: 550 }}>
                    <DataGrid
                      rows={topProductsRows}
                      columns={topProductsColumns}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: 15 },
                        },
                      }}
                      pageSizeOptions={[10, 15, 25]}
                      disableRowSelectionOnClick
                      slots={{ toolbar: GridToolbar }}
                      slotProps={{
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                      }}
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                          border: 'none',
                          py: 1
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          borderRadius: 2,
                          fontWeight: 700
                        },
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease'
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: `1px solid ${theme.palette.divider}`,
                          bgcolor: alpha(theme.palette.grey[50], 0.5)
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Store sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Không có dữ liệu sản phẩm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có đơn hàng nào trong khoảng thời gian này
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution with Enhanced Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: 700, borderRadius: 4 }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 48, height: 48 }}>
                      <Category />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        🗂️ Phân tích danh mục
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tỷ trọng doanh thu từng danh mục
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" endIcon={<PieChartIcon />}>
                    Chi tiết
                  </Button>
                </Box>
                
                {categoryPieData.length > 0 ? (
                  <>
                    {/* Enhanced Pie Chart */}
                    <Box sx={{ height: 350, mb: 3 }}>
                      <PieChart
                        series={[{
                          data: categoryPieData,
                          innerRadius: 60,
                          outerRadius: 140,
                          paddingAngle: 3,
                          cornerRadius: 8,
                          highlightScope: { faded: 'global', highlighted: 'item' },
                          faded: { innerRadius: 30, additionalRadius: -30, opacity: 0.5 }
                        }]}
                        height={350}
                        margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                        slotProps={{
                          legend: {
                            direction: 'column',
                            position: { vertical: 'middle', horizontal: 'right' },
                            padding: 10,
                            itemMarkWidth: 12,
                            itemMarkHeight: 12,
                            markGap: 8,
                            itemGap: 8,
                          },
                        }}
                      />
                    </Box>
                    
                    {/* Enhanced Category Stats */}
                    <Paper sx={{ 
                      p: 3, 
                      bgcolor: alpha(theme.palette.primary.main, 0.05), 
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                      <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                        📊 Tổng quan danh mục
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} color="primary">
                              {analytics.topCategories?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Tổng danh mục
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} color="success.main">
                              {formatCurrency(Math.max(...(analytics.topCategories?.map(c => c.revenue) || [0])))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Doanh thu cao nhất
                            </Typography>
                          </Box>
                        </Grid>
                        
                      </Grid>
                    </Paper>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Category sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Không có dữ liệu danh mục
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có sản phẩm nào được bán
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default AdvancedDashboard;