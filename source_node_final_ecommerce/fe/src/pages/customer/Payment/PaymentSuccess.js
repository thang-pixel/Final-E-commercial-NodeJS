import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, CircularProgress, Alert, 
  Grid, Chip, Divider
} from '@mui/material';
import { CheckCircle, Home, History, Receipt } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { getOrderDetail } from '../../../redux/reducers/orderSlice';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const orderId = searchParams.get('order_id');
  
  useEffect(() => {
    if (orderId) {
      dispatch(getOrderDetail(orderId))
        .then(result => {
          if (getOrderDetail.fulfilled.match(result)) {
            setOrder(result.payload.data);
          } else {
            setError('Không thể tải thông tin đơn hàng');
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Lỗi khi tải thông tin đơn hàng');
          setLoading(false);
        });
    } else {
      setError('Không tìm thấy thông tin đơn hàng');
      setLoading(false);
    }
  }, [orderId, dispatch]);
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang xác nhận thanh toán...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header thành công */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'success.50' }}>
        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
          Thanh toán thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Cảm ơn bạn đã thanh toán qua VNPay. Đơn hàng của bạn đang được xử lý.
        </Typography>
        
        {order && (
          <Alert severity="info" sx={{ mb: 0 }}>
            <Typography variant="body2">
              Mã đơn hàng: <strong>{order.order_number}</strong><br/>
              Tổng tiền đã thanh toán: <strong>{order.total_amount.toLocaleString()}đ</strong><br/>
              Phương thức: <strong>VNPay</strong>
            </Typography>
          </Alert>
        )}
      </Paper>
      
      {order && (
        <>
          {/* Thông tin đơn hàng */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1 }} />
              Chi tiết đơn hàng
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                <Chip 
                  label="Đã xác nhận" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>

            {/* Danh sách sản phẩm */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Sản phẩm ({order.items.length}):
            </Typography>
            
            {order.items.map((item, index) => (
              <Box key={index} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1,
                p: 1,
                bgcolor: 'grey.50',
                borderRadius: 1
              }}>
                <Box
                  component="img"
                  src={item.image_url}
                  alt={item.name}
                  sx={{ width: 50, height: 50, objectFit: 'cover', mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  {item.attributes && item.attributes.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {item.attributes.map(attr => `${attr.code}: ${attr.value}`).join(', ')}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block">
                    Số lượng: {item.quantity} | Giá: {item.price.toLocaleString()}đ
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {item.total_price.toLocaleString()}đ
                </Typography>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Tính toán giá */}
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography>Tạm tính:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography>{order.subtotal.toLocaleString()}đ</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography>Phí vận chuyển:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography>
                  {order.shipping_fee === 0 ? 'Miễn phí' : `${order.shipping_fee.toLocaleString()}đ`}
                </Typography>
              </Grid>
              
              {order.discount_amount > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography>Giảm giá:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography color="success.main">
                      -{order.discount_amount.toLocaleString()}đ
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
                  {order.total_amount.toLocaleString()}đ
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Thông tin giao hàng */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Địa chỉ giao hàng
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {order.shipping_address.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shipping_address.phone}
            </Typography>
            <Typography variant="body2">
              {order.shipping_address.address}
              {order.shipping_address.ward && `, ${order.shipping_address.ward}`}
              {order.shipping_address.district && `, ${order.shipping_address.district}`}
              {order.shipping_address.province && `, ${order.shipping_address.province}`}
            </Typography>
          </Paper>

          {/* Điểm tích lũy */}
          {order.loyalty_points_earned > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1">
                🎉 Bạn đã tích lũy được <strong>{order.loyalty_points_earned.toLocaleString()} điểm</strong> từ đơn hàng này!
              </Typography>
              <Typography variant="body2">
                Điểm có thể sử dụng ngay cho đơn hàng tiếp theo.
              </Typography>
            </Alert>
          )}
        </>
      )}
      
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </Button>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => navigate('/account/orders')}
        >
          Xem đơn hàng
        </Button>
        {order && (
          <Button
            variant="outlined"
            startIcon={<Receipt />}
            onClick={() => navigate(`/account/orders/${order._id}`)}
          >
            Chi tiết đơn hàng
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default PaymentSuccess;