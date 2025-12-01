import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Alert, Divider
} from '@mui/material';
import { ErrorOutline, Home, Refresh, History } from '@mui/icons-material';

function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason') || searchParams.get('error') || 'Lỗi không xác định';
  
  // Decode lý do lỗi từ URL
  const decodedReason = decodeURIComponent(reason);
  
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.50' }}>
        <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" color="error.main" sx={{ mb: 1 }}>
          Thanh toán thất bại!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Rất tiếc, thanh toán VNPay của bạn không thành công.
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={600}>
            Lý do thất bại:
          </Typography>
          <Typography variant="body2">
            {decodedReason}
          </Typography>
        </Alert>

        {orderId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Đơn hàng của bạn vẫn được lưu với trạng thái "Chờ thanh toán".<br/>
              Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.
            </Typography>
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Bạn có thể thực hiện:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            fullWidth
          >
            Về trang chủ
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => navigate('/account/orders')}
            fullWidth
          >
            Xem danh sách đơn hàng
          </Button>
          
          {orderId && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Refresh />}
              onClick={() => navigate(`/account/orders/${orderId}`)}
              fullWidth
            >
              Xem chi tiết & thử thanh toán lại
            </Button>
          )}
          
          <Button
            variant="text"
            onClick={() => navigate('/cart')}
            fullWidth
          >
            Quay lại giỏ hàng
          </Button>
        </Box>

        {/* Thông tin hỗ trợ */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Cần hỗ trợ?</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Liên hệ hotline: 1900-1234 hoặc email: support@eshop.com<br/>
            để được hỗ trợ về vấn đề thanh toán.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default PaymentFailed;