import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack,
  Schedule,
  Assignment,
  LocalShipping,
  CheckCircle,
  Cancel,
  Phone,
  LocationOn,
  Payment,
  Note,
  Star
} from '@mui/icons-material';
import { getOrderDetail, cancelOrder } from '../../../redux/reducers/orderSlice';

// Status mapping với màu sắc cho timeline
const ORDER_STATUS = {
  'PENDING': { 
    label: 'Chờ xử lý', 
    color: 'warning', 
    icon: <Schedule />,
    timelineColor: 'warning'
  },
  'CONFIRMED': { 
    label: 'Đã xác nhận', 
    color: 'info', 
    icon: <Assignment />,
    timelineColor: 'primary'
  },
  'PROCESSING': { 
    label: 'Đang xử lý', 
    color: 'primary', 
    icon: <Assignment />,
    timelineColor: 'primary'
  },
  'SHIPPING': { 
    label: 'Đang giao', 
    color: 'secondary', 
    icon: <LocalShipping />,
    timelineColor: 'secondary'
  },
  'DELIVERED': { 
    label: 'Đã giao', 
    color: 'success', 
    icon: <CheckCircle />,
    timelineColor: 'success'
  },
  'CANCELLED': { 
    label: 'Đã hủy', 
    color: 'error', 
    icon: <Cancel />,
    timelineColor: 'error'
  },
  'REFUNDED': { 
    label: 'Đã hoàn tiền', 
    color: 'default', 
    icon: <Cancel />,
    timelineColor: 'grey'
  }
};

const PAYMENT_METHOD = {
  'COD': 'Thanh toán khi nhận hàng',
  'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
  'CREDIT_CARD': 'Thẻ tín dụng',
  'E_WALLET': 'Ví điện tử'
};

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentOrder, loading, error } = useSelector(state => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetail(orderId));
    }
  }, [dispatch, orderId]);

  const handleCancelOrder = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      const reason = prompt('Vui lòng nhập lý do hủy đơn:');
      if (reason) {
        try {
          await dispatch(cancelOrder({ orderId, reason }));
          // Refresh chi tiết đơn hàng
          dispatch(getOrderDetail(orderId));
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/account/orders')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!currentOrder) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không tìm thấy đơn hàng</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/account/orders')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/account/orders')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4">
            Chi tiết đơn hàng #{currentOrder.order_number}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {ORDER_STATUS[currentOrder.status]?.icon}
          <Chip 
            label={ORDER_STATUS[currentOrder.status]?.label || currentOrder.status}
            color={ORDER_STATUS[currentOrder.status]?.color || 'default'}
            size="medium"
          />
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="flex-start">
        {/* Thông tin đơn hàng */}
        <Grid item xs={12} md={8}>
          {/* Order Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Trạng thái đơn hàng
              </Typography>
              
              <Timeline>
                {currentOrder.status_history
                  .slice()
                  .reverse() // Hiển thị mới nhất trên cùng
                  .map((history, index) => (
                    <TimelineItem key={index}>
                      <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(history.timestamp)}
                      </TimelineOppositeContent>
                      
                      <TimelineSeparator>
                        <TimelineDot 
                          color={ORDER_STATUS[history.status]?.timelineColor || 'grey'}
                          variant={index === 0 ? 'filled' : 'outlined'}
                        >
                          {ORDER_STATUS[history.status]?.icon || <Assignment />}
                        </TimelineDot>
                        {index < currentOrder.status_history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                          {ORDER_STATUS[history.status]?.label || history.status}
                        </Typography>
                        {history.note && (
                          <Typography variant="body2" color="text.secondary">
                            {history.note}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
              </Timeline>
            </CardContent>
          </Card>

          {/* Sản phẩm */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sản phẩm ({currentOrder.items.length} sản phẩm)
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.image_url}
                              alt={item.name}
                              sx={{ 
                                width: 60, 
                                height: 60, 
                                objectFit: 'cover', 
                                mr: 2,
                                borderRadius: 1 
                              }}
                            />
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {item.SKU}
                              </Typography>
                              {item.attributes && item.attributes.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  {item.attributes.map(attr => `${attr.code}: ${attr.value}`).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.quantity} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {formatPrice(item.total_price)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Tổng tiền */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Tạm tính:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>{formatPrice(currentOrder.subtotal)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography>Phí vận chuyển:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>
                      {currentOrder.shipping_fee === 0 ? 'Miễn phí' : formatPrice(currentOrder.shipping_fee)}
                    </Typography>
                  </Grid>

                  {currentOrder.discount_amount > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>Giảm giá:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography color="success.main">
                          -{formatPrice(currentOrder.discount_amount)}
                        </Typography>
                      </Grid>
                    </>
                  )}

                  {currentOrder.loyalty_points_used > 0 && (
                    <>
                      <Grid item xs={6}>
                        <Typography>Điểm tích lũy đã dùng:</Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography color="primary.main">
                          -{currentOrder.loyalty_points_used.toLocaleString()} điểm
                        </Typography>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="h6">Tổng cộng:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="h6" color="error">
                      {formatPrice(currentOrder.total_amount)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Loyalty points earned */}
              {currentOrder.loyalty_points_earned > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1 }} />
                    <Typography>
                      Bạn đã nhận được <strong>{currentOrder.loyalty_points_earned.toLocaleString()} điểm</strong> từ đơn hàng này!
                    </Typography>
                  </Box>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Thông tin bên phải */}
        <Grid item xs={12} md={4}>
          {/* Thông tin giao hàng */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} />
                Địa chỉ giao hàng
              </Typography>
              
              <Typography variant="body1" fontWeight={600}>
                {currentOrder.shipping_address.full_name}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Phone sx={{ mr: 1, fontSize: 16 }} />
                {currentOrder.shipping_address.phone}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {currentOrder.shipping_address.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  currentOrder.shipping_address.ward,
                  currentOrder.shipping_address.district,
                  currentOrder.shipping_address.province
                ].filter(Boolean).join(', ')}
              </Typography>
            </CardContent>
          </Card>

          {/* Thông tin thanh toán */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} />
                Thanh toán
              </Typography>
              
              <Typography variant="body1">
                {PAYMENT_METHOD[currentOrder.payment_method] || currentOrder.payment_method}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Trạng thái: {currentOrder.payment_status || 'PENDING'}
              </Typography>
            </CardContent>
          </Card>

          {/* Ghi chú */}
          {currentOrder.customer_note && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Note sx={{ mr: 1 }} />
                  Ghi chú
                </Typography>
                
                <Typography variant="body2">
                  {currentOrder.customer_note}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Hành động
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['PENDING', 'CONFIRMED'].includes(currentOrder.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={handleCancelOrder}
                    fullWidth
                  >
                    Hủy đơn hàng
                  </Button>
                )}
                
                {currentOrder.status === 'DELIVERED' && (
                  <Button
                    variant="outlined"
                    startIcon={<Star />}
                    fullWidth
                    disabled
                  >
                    Đánh giá sản phẩm
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default OrderDetail;