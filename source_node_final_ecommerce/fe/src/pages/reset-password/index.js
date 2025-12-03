import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Email,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ');
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/auth/reset-password`,
        { token }
      );

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Không thể khôi phục mật khẩu. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 500,
          width: '100%',
          mx: 2,
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            🔑 Khôi phục mật khẩu
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Xác nhận khôi phục mật khẩu tài khoản
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              icon={<Error />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                <strong>{error}</strong>
              </Typography>
            </Alert>
          )}

          {success ? (
            <Card sx={{ bgcolor: '#d4edda', border: '1px solid #c3e6cb' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle 
                  sx={{ 
                    fontSize: 64, 
                    color: 'success.main',
                    mb: 2 
                  }} 
                />
                <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
                  Khôi phục thành công!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Mật khẩu mới đã được gửi về email của bạn.
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#fff3cd', 
                  borderRadius: 2, 
                  border: '1px solid #ffeaa7',
                  mb: 3
                }}>
                  <Typography variant="body2" color="warning.main">
                    <strong>📧 Kiểm tra email để nhận mật khẩu mới</strong>
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ mt: 2 }}
                >
                  Đăng nhập ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {!error && (
                <>
                  <Email sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Xác nhận khôi phục mật khẩu
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Nhấn nút bên dưới để xác nhận và nhận mật khẩu mới qua email.
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleResetPassword}
                    disabled={loading || !token}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
                      }
                    }}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận khôi phục'}
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Back to login */}
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e9ecef' }}>
            <Button
              component={Link}
              to="/login"
              variant="text"
              startIcon={<ArrowBack />}
              sx={{ color: '#667eea', textTransform: 'none' }}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default ResetPassword;