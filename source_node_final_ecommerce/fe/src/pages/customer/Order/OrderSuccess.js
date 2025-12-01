import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { CheckCircle, Receipt, Home, History } from '@mui/icons-material';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { order, loyaltyPointsEarned } = location.state || {};
  
  if (!order) {
    navigate('/');
    return null;
  }
  
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header thành công */}
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'success.50' }}>
        <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" color="success.main" sx={{ mb: 1 }}>
          Đặt hàng thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Cảm ơn bạn đã mua sắm tại E-Shop. Đơn hàng của bạn đang được xử lý.
        </Typography>
      </Paper>
      
      {/* Thông tin đơn hàng */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Receipt sx={{ mr: 1 }} />
          Thông tin đơn hàng
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Mã đơn hàng:</Typography>
            <Typography variant="h6">{order.order_number}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
            <Typography variant="body1">
              {new Date(order.createdAt).toLocaleString('vi-VN')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
            <Chip label="Đang xử lý" color="warning" size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Phương thức thanh toán:</Typography>
            <Typography variant="body1">{order.payment_method}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Chi tiết sản phẩm */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sản phẩm đã đặt
        </Typography>
        
        {order.items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src={item.image_url}
              alt={item.name}
              sx={{ width: 60, height: 60, objectFit: 'cover', mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.attributes?.map(attr => `${attr.code}: ${attr.value}`).join(', ')}
              </Typography>
              <Typography variant="body2">
                Số lượng: {item.quantity} | Giá: {item.price.toLocaleString()}đ
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={600}>
              {item.total_price.toLocaleString()}đ
            </Typography>
          </Box>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        {/* Tổng tiền */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Tạm tính:</Typography>
          <Typography>{order.subtotal.toLocaleString()}đ</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Phí vận chuyển:</Typography>
          <Typography>
            {order.shipping_fee === 0 ? 'Miễn phí' : `${order.shipping_fee.toLocaleString()}đ`}
          </Typography>
        </Box>
        
        {order.discount_amount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Giảm giá:</Typography>
            <Typography color="success.main">-{order.discount_amount.toLocaleString()}đ</Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Tổng cộng:</Typography>
          <Typography variant="h6" color="error">
            {order.total_amount.toLocaleString()}đ
          </Typography>
        </Box>
      </Paper>
      
      {/* Điểm tích lũy */}
      {loyaltyPointsEarned > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            🎉 Bạn đã tích lũy được <strong>{loyaltyPointsEarned.toLocaleString()} điểm</strong> từ đơn hàng này!
          </Typography>
          <Typography variant="body2">
            Điểm có thể sử dụng ngay cho đơn hàng tiếp theo.
          </Typography>
        </Alert>
      )}
      
      {/* Thông tin giao hàng */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Địa chỉ giao hàng
        </Typography>
        <Typography variant="body1">{order.shipping_address.full_name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {order.shipping_address.phone}
        </Typography>
        <Typography variant="body2">
          {order.shipping_address.address}, {order.shipping_address.ward}, 
          {order.shipping_address.district}, {order.shipping_address.province}
        </Typography>
      </Paper>
      
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
      </Box>
    </Box>
  );
}

export default OrderSuccess;