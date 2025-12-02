import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Stack,
  Divider,
  IconButton,
  Badge,
  CardActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton
} from '@mui/material';
import {
  People,
  ShoppingCart,
  AttachMoney,
  TrendingUp,
  Refresh,
  PersonAdd,
  Receipt,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  ShoppingBag,
  LocalShipping,
  Cancel,
  CheckCircle,
  Schedule,
  Star,
  Storefront,
  Assignment
} from '@mui/icons-material';

const SimpleDashboard = ({ data, loading, onRefresh }) => {
  if (!data) return null;

  const { overview, charts, recent } = data;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format compact number
  const formatCompactNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString();
  };

  // Status colors and icons
  const statusConfig = {
    PENDING: { color: '#ff9800', icon: Schedule, label: 'Chờ xử lý', lightColor: '#fff3e0' },
    CONFIRMED: { color: '#2196f3', icon: Assignment, label: 'Đã xác nhận', lightColor: '#e3f2fd' },
    PROCESSING: { color: '#9c27b0', icon: ShoppingBag, label: 'Đang xử lý', lightColor: '#f3e5f5' },
    SHIPPING: { color: '#ff5722', icon: LocalShipping, label: 'Đang giao', lightColor: '#fbe9e7' },
    DELIVERED: { color: '#4caf50', icon: CheckCircle, label: 'Đã giao', lightColor: '#e8f5e8' },
    CANCELLED: { color: '#f44336', icon: Cancel, label: 'Đã hủy', lightColor: '#ffebee' }
  };

  // Calculate growth percentage (mock data for demo)
  const getGrowthPercentage = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <Box>
      {/* Header with Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          📊 Tổng quan hệ thống
        </Typography>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          onClick={onRefresh}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Làm mới
        </Button>
      </Box>

      {/* Key Metrics Cards - Enhanced Design */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%', maxWidth: '100%' }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            sx={{ 
              minWidth: '300px',
              minHeight: '150px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {(overview.totalUsers)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tổng người dùng
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" fontWeight={600}>
                    +{overview.newUsersToday} hôm nay
                  </Typography>
                </Box>
                <Badge badgeContent={overview.newUsersThisMonth} color="error" showZero>
                  <PersonAdd />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            sx={{ 
              minWidth: '300px',
              minHeight: '150px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ShoppingCart sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {(overview.totalOrders)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tổng đơn hàng
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" fontWeight={600}>
                    +{overview.ordersToday} hôm nay
                  </Typography>
                </Box>
                <Badge badgeContent={overview.ordersThisMonth} color="warning" showZero>
                  <Receipt />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            sx={{ 
              minWidth: '300px',
              minHeight: '150px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AttachMoney sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(overview.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Tổng doanh thu
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Hôm nay: {formatCurrency(overview.todayRevenue)}
                  </Typography>
                </Box>
                <ArrowUpward fontSize="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Year Revenue */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            sx={{ 
              minWidth: '300px',
              minHeight: '150px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUp sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight={700}>
                    {formatCurrency(overview.yearRevenue)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Năm {new Date().getFullYear()}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Từ đầu năm đến nay
                </Typography>
                <Star fontSize="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Order Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, width: '600px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  📋 Trạng thái đơn hàng
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              
              <Stack spacing={2}>
                {charts.orderStatusDistribution.map((status, index) => {
                  const config = statusConfig[status._id] || { color: '#9e9e9e', label: status._id };
                  const IconComponent = config.icon;
                  const total = charts.orderStatusDistribution.reduce((sum, item) => sum + item.count, 0);
                  const percentage = ((status.count / total) * 100).toFixed(1);
                  
                  return (
                    <Box key={status._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: config.lightColor, 
                              color: config.color, 
                              width: 32, 
                              height: 32, 
                              mr: 2 
                            }}
                          >
                            <IconComponent fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {config.label}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" fontWeight={700}>
                            {status.count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {percentage}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(percentage)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: config.lightColor,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: config.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Best Selling Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, width: '600px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  🏆 Top sản phẩm bán chạy
                </Typography>
                <Button size="small" endIcon={<Visibility />}>
                  Xem tất cả
                </Button>
              </Box>
              
              <Stack spacing={1}>
                {charts.bestSellingProducts.slice(0, 5).map((product, index) => (
                  <Box key={product._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                      <Box sx={{ 
                        minWidth: 40, 
                        height: 40, 
                        bgcolor: index < 3 ? 'primary.main' : 'grey.300',
                        color: index < 3 ? 'white' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        mr: 2,
                        fontWeight: 700
                      }}>
                        #{index + 1}
                      </Box>
                      
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Doanh thu: {formatCurrency(product.revenue)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={`${product.totalSold} SP`} 
                          size="small"
                          color={index < 3 ? 'primary' : 'default'}
                          variant={index < 3 ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </Box>
                    
                    {index < charts.bestSellingProducts.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders & User Growth */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  🛒 Đơn hàng gần đây
                </Typography>
                <Button size="small" endIcon={<ArrowUpward />}>
                  Xem chi tiết
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="right">Tổng tiền</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recent.orders.map((order) => {
                      const statusInfo = statusConfig[order.status] || { color: '#9e9e9e', label: order.status };
                      
                      return (
                        <TableRow key={order._id} hover>
                          <TableCell>
                            <Typography variant="body2" color="primary" fontWeight={600}>
                              #{order.order_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {order.customer_id?.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.customer_id?.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={statusInfo.label}
                              size="small"
                              sx={{
                                bgcolor: statusInfo.lightColor,
                                color: statusInfo.color,
                                fontWeight: 600,
                                border: `1px solid ${statusInfo.color}20`
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              {formatCurrency(order.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="primary">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Growth */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', width: '400px' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                📈 Tăng trưởng người dùng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                7 ngày qua
              </Typography>
              
              <Stack spacing={2}>
                {charts.userGrowth.slice(-7).map((day, index) => {
                  const isToday = index === charts.userGrowth.length - 1;
                  const maxCount = Math.max(...charts.userGrowth.map(d => d.count));
                  const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  
                  return (
                    <Box key={day._id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={isToday ? 700 : 400}>
                          {new Date(day._id).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={isToday ? 'primary.main' : 'text.primary'}>
                          +{day.count}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isToday ? 'primary.main' : 'info.main',
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="body2" color="primary.main" fontWeight={600} textAlign="center">
                  📊 Trung bình {(charts.userGrowth.reduce((sum, day) => sum + day.count, 0) / charts.userGrowth.length).toFixed(1)} người dùng/ngày
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimpleDashboard;