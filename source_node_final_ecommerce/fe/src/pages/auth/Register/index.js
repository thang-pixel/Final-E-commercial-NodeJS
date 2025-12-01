import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd,
  Email,
  Person,
  Phone,
  Home,
  LocationOn,
  ArrowBack,
  CheckCircle,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../redux/actions/authAction';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    // Thông tin cá nhân
    email: '',
    full_name: '',
    phone: '',
    // Địa chỉ
    address: '',
    ward: '',
    district: '',
    province: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form validation
  const [errors, setErrors] = useState({});

  // Steps for registration
  const steps = ['Thông tin cá nhân', 'Địa chỉ', 'Xác nhận'];

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
  };

  // Validate form
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      // Validate personal info
      if (!formData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Định dạng email không hợp lệ';
      }

      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Họ tên là bắt buộc';
      } else if (formData.full_name.trim().length < 2) {
        newErrors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (step === 1) {
      // Validate address
      if (!formData.address.trim()) {
        newErrors.address = 'Địa chỉ cụ thể là bắt buộc';
      }
      if (!formData.ward.trim()) {
        newErrors.ward = 'Phường/Xã là bắt buộc';
      }
      if (!formData.district.trim()) {
        newErrors.district = 'Quận/Huyện là bắt buộc';
      }
      if (!formData.province.trim()) {
        newErrors.province = 'Tỉnh/Thành phố là bắt buộc';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle register
  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Final validation
      const isStep0Valid = validateStep(0);
      const isStep1Valid = validateStep(1);

      if (!isStep0Valid || !isStep1Valid) {
        setLoading(false);
        return;
      }

      console.log('📝 Submitting registration data:', formData);

      const result = await dispatch(registerUser(formData));

      if (result.success) {
        console.log('✅ Registration successful');
        setSuccess('Đăng ký thành công! Mật khẩu đã được gửi về email của bạn.');
        
        // Redirect sau 3 giây
        setTimeout(() => {
          navigate('/account/profile');
        }, 3000);
      } else {
        console.error('❌ Registration failed:', result.message);
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in key="step0">
            <Box>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ mr: 1 }} />
                Thông tin cá nhân
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
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
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color={errors.full_name ? 'error' : 'primary'} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone || 'Ví dụ: 0123456789'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color={errors.phone ? 'error' : 'primary'} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="0123456789"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in key="step1">
            <Box>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationOn sx={{ mr: 1 }} />
                Địa chỉ giao hàng
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sx={{ minWidth: '100%' }} >
                  <TextField
                    fullWidth
                    label="Địa chỉ cụ thể"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home color={errors.address ? 'error' : 'primary'} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Số 123, đường ABC..."
                    multiline
                    rows={2}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Phường/Xã"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    error={!!errors.ward}
                    helperText={errors.ward}
                    placeholder="Phường 1"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Quận/Huyện"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    error={!!errors.district}
                    helperText={errors.district}
                    placeholder="Quận 1"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Tỉnh/Thành phố"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    error={!!errors.province}
                    helperText={errors.province}
                    placeholder="TP. Hồ Chí Minh"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in key="step2">
            <Box>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CheckCircle sx={{ mr: 1 }} />
                Xác nhận thông tin
              </Typography>
              
              {/* Thông tin cá nhân */}
              <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    📧 Thông tin cá nhân
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body1" fontWeight={500}>{formData.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                      <Typography variant="body1" fontWeight={500}>{formData.full_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                      <Typography variant="body1" fontWeight={500}>{formData.phone}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Địa chỉ */}
              <Card sx={{ mb: 3, bgcolor: '#f0f8ff' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    📍 Địa chỉ giao hàng
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {[formData.ward, formData.district, formData.province].filter(Boolean).join(', ')}
                  </Typography>
                </CardContent>
              </Card>

              {/* Thông báo về mật khẩu */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>🔐 Về mật khẩu tài khoản:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  • Mật khẩu sẽ được tạo tự động và gửi về email của bạn<br />
                  • Vui lòng kiểm tra hộp thư (bao gồm cả thư rác)<br />
                  • Sau khi đăng nhập, bạn có thể đổi mật khẩu trong trang Hồ sơ cá nhân
                </Typography>
              </Alert>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={activeStep === 0 ? () => navigate('/login') : handleBack}
          startIcon={<ArrowBack />}
          disabled={loading}
        >
          {activeStep === 0 ? 'Đăng nhập' : 'Quay lại'}
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
            >
              {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        //background: 'linear-gradient(135deg, #ffffffff 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 800,
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
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Đăng ký tài khoản mới
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Tham gia cộng đồng mua sắm trực tuyến hàng đầu
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: activeStep === index ? 600 : 400
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4, pt: 2, minHeight: 400 }}>
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
              <Typography variant="body2" sx={{ mt: 1 }}>
                🔄 Đang chuyển hướng đến trang cá nhân...
              </Typography>
            </Alert>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Action Buttons */}
          {renderActionButtons()}
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
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Đăng nhập ngay
            </Link>
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link to="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link to="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>
              Chính sách bảo mật
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;