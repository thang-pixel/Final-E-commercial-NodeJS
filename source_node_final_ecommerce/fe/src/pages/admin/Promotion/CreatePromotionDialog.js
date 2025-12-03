import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  InputAdornment,
  Box
} from '@mui/material';
import axios from 'axios';
import { API_DOMAIN } from '../../../constants/apiDomain';
import { useNotification } from '../../../hooks/useNotification';
const CreatePromotionDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    max_discount_amount: '',
    min_order_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    applicable_to: 'ALL'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showSuccess, showError, NotificationComponent } = useNotification();

  const token = localStorage.getItem("token");

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_DOMAIN}/api/promotions`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      setError(error.response?.data?.message || 'Lỗi khi tạo mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      max_discount_amount: '',
      min_order_amount: '',
      usage_limit: '',
      start_date: '',
      end_date: '',
      applicable_to: 'ALL'
    });
    setError('');
    onClose();
  };


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Tạo mã giảm giá mới</DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            
            {/* Hàng 1: Mã và Tên */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã giảm giá *"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="VD: WELCOME2024"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên mã giảm giá *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Chào mừng năm mới"
                size="small"
              />
            </Grid>

            {/* Hàng 2: Mô tả (Full width) */}
            <Grid item xs={12} minWidth="100%">
              <TextField
                fullWidth
                label="Mô tả"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Mô tả chi tiết về mã giảm giá"
                size="small"
              />
            </Grid>

            {/* Hàng 3: Loại và Giá trị giảm */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại giảm giá *</InputLabel>
                <Select
                  value={formData.discount_type}
                  onChange={(e) => handleChange('discount_type', e.target.value)}
                  label="Loại giảm giá *"
                >
                  <MenuItem value="PERCENTAGE">Phần trăm (%)</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giá trị giảm *"
                type="number"
                value={formData.discount_value}
                onChange={(e) => handleChange('discount_value', e.target.value)}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.discount_type === 'PERCENTAGE' ? '%' : 'VNĐ'}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Hàng 4: Giảm tối đa và Đơn hàng tối thiểu */}
            {formData.discount_type === 'PERCENTAGE' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Giảm tối đa"
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) => handleChange('max_discount_amount', e.target.value)}
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
                  }}
                  helperText="Để trống nếu không giới hạn"
                />
              </Grid>
            )}

            <Grid item xs={12} md={formData.discount_type === 'PERCENTAGE' ? 6 : 6}>
              <TextField
                fullWidth
                label="Đơn hàng tối thiểu"
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => handleChange('min_order_amount', e.target.value)}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
                }}
                helperText="Để trống nếu không giới hạn"
              />
            </Grid>

            {/* Hàng 5: Số lượt sử dụng */}
            <Grid item xs={12} md={6} minWidth="50%">
              <TextField
                fullWidth
                label="Số lượt sử dụng"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => handleChange('usage_limit', e.target.value)}
                size="small"
                helperText="Để trống nếu không giới hạn"
              />
            </Grid>

            {/* Separator cho phần thời gian */}
            <Grid item xs={12} sx={{ mt: 2 }} minWidth="100%">
              <Typography variant="h6" sx={{ borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                Thời gian hiệu lực
              </Typography>
            </Grid>

            {/* Hàng 6: Thời gian */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu *"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc *"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} size="large">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          disabled={loading || !formData.code || !formData.name || !formData.discount_value || !formData.start_date || !formData.end_date}
        >
          {loading ? 'Đang tạo...' : 'Tạo mã giảm giá'}
        </Button>
      </DialogActions>
      <NotificationComponent />
    </Dialog>
  );
};

export default CreatePromotionDialog;