import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import { 
  ShoppingBag, 
  Visibility, 
  Cancel, 
  LocalShipping,
  CheckCircle,
  Schedule,
  Assignment
} from '@mui/icons-material';
import { getMyOrders, cancelOrder } from '../../../redux/reducers/orderSlice';

// Status mapping
const ORDER_STATUS = {
  'PENDING': { label: 'Chờ xử lý', color: 'warning', icon: <Schedule /> },
  'CONFIRMED': { label: 'Đã xác nhận', color: 'info', icon: <Assignment /> },
  'PROCESSING': { label: 'Đang xử lý', color: 'primary', icon: <Assignment /> },
  'SHIPPING': { label: 'Đang giao', color: 'secondary', icon: <LocalShipping /> },
  'DELIVERED': { label: 'Đã giao', color: 'success', icon: <CheckCircle /> },
  'CANCELLED': { label: 'Đã hủy', color: 'error', icon: <Cancel /> },
  'REFUNDED': { label: 'Đã hoàn tiền', color: 'default', icon: <Cancel /> }
};

function OrderList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { orders, loading, error, meta } = useSelector(state => state.orders);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 5
    };
    
    if (statusFilter) {
      params.status = statusFilter;
    }
    
    dispatch(getMyOrders(params));
  }, [dispatch, currentPage, statusFilter]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset về trang 1
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (orderId) => {
    navigate(`/account/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const reason = prompt('Vui lòng nhập lý do hủy đơn:');
      if (reason) {
        try {
          await dispatch(cancelOrder({ orderId, reason }));
          // Refresh danh sách
          dispatch(getMyOrders({ 
            page: currentPage, 
            limit: 5,
            ...(statusFilter && { status: statusFilter })
          }));
        } catch (error) {
          console.error('Cancel order error:', error);
        }
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <ShoppingBag sx={{ mr: 1 }} />
        Đơn hàng của tôi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Tổng: {meta?.totalItems || 0} đơn hàng
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Order List */}
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Bạn chưa có đơn hàng nào
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/products')}
          >
            Mua sắm ngay
          </Button>
        </Paper>
      ) : (
        <Box>
          {orders.map((order) => (
            <Card key={order._id} sx={{ mb: 2, overflow: 'visible' }}>
              <CardContent>
                {/* Header */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" color="primary">
                      #{order.order_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đặt hàng: {formatDate(order.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: { xs: 'flex-start', md: 'flex-end' }, 
                      mb: 1,
                      gap: 1
                    }}>
                      {ORDER_STATUS[order.status]?.icon}
                      <Chip 
                        label={ORDER_STATUS[order.status]?.label || order.status}
                        color={ORDER_STATUS[order.status]?.color || 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" color="error">
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Items Preview - Optimized Layout */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Sản phẩm ({order.items.length}):
                  </Typography>
                  
                  {order.items.length === 1 ? (
                    // Layout cho 1 sản phẩm - hiển thị ngang
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      p: 1, 
                      bgcolor: 'grey.50', 
                      borderRadius: 1 
                    }}>
                      <Avatar
                        src={order.items[0].image_url}
                        variant="rounded"
                        sx={{ width: 50, height: 50 }}
                      >
                        <ShoppingBag />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {order.items[0].name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Số lượng: {order.items[0].quantity}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        {formatPrice(order.items[0].total_price)}
                      </Typography>
                    </Box>
                  ) : (
                    // Layout cho nhiều sản phẩm - hiển thị grid
                    <Box>
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        sx={{ 
                          flexWrap: 'wrap',
                          '& > *': {
                            flex: 'none'
                          }
                        }}
                      >
                        {order.items.slice(0, 4).map((item, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              minWidth: 80,
                              maxWidth: 100,
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <Avatar
                              src={item.image_url}
                              variant="rounded"
                              sx={{ width: 45, height: 45, mb: 0.5 }}
                            >
                              <ShoppingBag />
                            </Avatar>
                            <Typography 
                              variant="caption" 
                              align="center" 
                              sx={{ 
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                fontSize: '0.7rem'
                              }}
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              x{item.quantity}
                            </Typography>
                          </Box>
                        ))}
                        
                        {order.items.length > 4 && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            minWidth: 80,
                            p: 1,
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: 'grey.300'
                          }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              +{order.items.length - 4}<br/>sản phẩm
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  justifyContent: 'flex-end',
                  pt: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDetail(order._id)}
                  >
                    Xem chi tiết
                  </Button>
                  
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {meta?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={meta.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default OrderList;