import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Login as LoginIcon,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  PersonAdd,
  ArrowBack
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import {
  socialLoginUser,
  guestLoginUser,
  loginUser,
} from '../../../redux/actions/authAction';
import ForgotPasswordDialog from '../../../components/ForgotPasswordDialog';
function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const from = location.state?.from?.pathname; // nơi user định vào trước khi bị chặn
  const message = location.state?.message; // thông báo từ StatusGuard
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Hiển thị thông báo từ StatusGuard khi component mount
  useEffect(() => {
    if (message) {
      setError(message);
    }
  }, [message]);
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error) {
      setError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('📝 Submitting login data:', { email: formData.email });

      const result = await dispatch(loginUser(formData.email, formData.password));
      console.log('Login result:', result);

      if (result.success) {
        if (result.user?.status === 'inactive') {
          setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        setSuccess('Đăng nhập thành công! Đang chuyển hướng...');
        // Navigation sẽ được xử lý bởi useEffect khi user state thay đổi
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError('Google login failed');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await dispatch(socialLoginUser('google', idToken));
      
      if (result.success) {
        if (result.user?.status === 'inactive') {
          setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        console.log('User logged in via Google:', result.user);
        setSuccess('Đăng nhập Google thành công!');
      } else {
        setError(result.message || 'Đăng nhập Google thất bại');
      }
    } catch (error) {
      setError('Lỗi đăng nhập Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle guest login
  const handleGuest = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await dispatch(guestLoginUser());
      
      if (result.success) {
        if (result.user?.status === 'inactive') {
          setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        setSuccess('Tiếp tục với tư cách khách!');
      } else {
        setError(result.message || 'Không thể tiếp tục với tư cách khách');
      }
    } catch (error) {
      setError('Lỗi khi tiếp tục với tư cách khách');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after login
  useEffect(() => {
    if (user && user.status === 'active') {
      console.log('user', user);
      
      // Delay để show success message
      const timer = setTimeout(() => {
        // Ưu tiên quay lại trang trước
        if (from && from !== '/login' && from !== '/register') {
          navigate(from, { replace: true });
          return;
        }
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, from, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            🛒 E-Shop Vietnam
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Đăng nhập để tiếp tục mua sắm
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>{success}</strong>
              </Typography>
            </Alert>
          )}

          {/* Login Form */}
          <Fade in>
            <Box component="form" onSubmit={handleLogin}>
              
              
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ minWidth: '100%' }}>
                  <TextField
                    fullWidth
                    label="Địa chỉ email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color={errors.email ? 'error' : 'primary'} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="example@gmail.com"
                    required
                    disabled={loading}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ minWidth: '100%' }}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={errors.password ? 'error' : 'primary'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nhập mật khẩu"
                    required
                    disabled={loading}
                  />
                </Grid>
              </Grid>

              {/* Login Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>

              {/* Forgot Password */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Button
                  variant="text"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textTransform: 'none'
                  }}
                >
                  Quên mật khẩu?
                </Button>
              </Box>
            </Box>
          </Fade>
          <ForgotPasswordDialog
            open={forgotPasswordOpen}
            onClose={() => setForgotPasswordOpen(false)}
          />

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Chip label="Hoặc" sx={{ bgcolor: '#f8f9fa', color: 'text.secondary' }} />
          </Divider>

          {/* Social Login */}
          <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Đăng nhập nhanh chóng
              </Typography>
              
              {/* Google Login */}
              <Box sx={{ mb: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Lỗi đăng nhập Google')}
                  disabled={loading}
                />
              </Box>
              
              {/* Guest Login */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<PersonAdd />}
                onClick={handleGuest}
                disabled={loading}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#5a67d8',
                    bgcolor: 'rgba(102, 126, 234, 0.04)'
                  }
                }}
              >
                Tiếp tục với tư cách khách
              </Button>
            </CardContent>
          </Card>


        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: '#f8f9fa',
            p: 3,
            textAlign: 'center',
            borderTop: '1px solid #e9ecef'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Đăng ký ngay
            </Link>
          </Typography>
          
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;