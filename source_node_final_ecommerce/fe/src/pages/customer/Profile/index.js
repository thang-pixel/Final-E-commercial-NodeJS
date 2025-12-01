import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Fade,
  Grid,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  AddLocationAlt, 
  Save, 
  Lock,
  Stars,
  AccountCircle,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  addAddress,
  updateAddress,
  deleteAddress,
  clearError,
  clearSuccess
} from '../../../redux/reducers/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, addresses, loading, error, success } = useSelector((state) => state.user);
  const [editInfo, setEditInfo] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  // Password change dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });

  // Address dialog
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({ 
    address: '',
    ward: '', 
    district: '', 
    province: '', 
    is_default: false 
  });
  const [editingAddr, setEditingAddr] = useState(null);

  // Load user info on mount
  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Format loyalty points
  const formatLoyaltyPoints = (points) => {
    return new Intl.NumberFormat('vi-VN').format(points || 0);
  };

  // Update info
  const handleUpdateInfo = () => {
    dispatch(updateMyProfile({
      full_name: form.full_name,
      phone: form.phone
    }));
    setEditInfo(false);
  };

  // Change password
  const handleChangePassword = () => {
    if (!pwForm.old_password || !pwForm.new_password) {
      dispatch({ 
        type: 'user/setError', 
        payload: 'Vui lòng điền đầy đủ thông tin mật khẩu' 
      });
      return;
    }
    
    if (pwForm.new_password.length < 6) {
      dispatch({ 
        type: 'user/setError', 
        payload: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
      return;
    }
    
    dispatch(changeMyPassword(pwForm));
    setPwOpen(false);
    setPwForm({ old_password: '', new_password: '' });
  };

  // Address CRUD
  const handleAddAddress = () => {
    if (!addrForm.address || !addrForm.ward || !addrForm.district || !addrForm.province) {
      dispatch({ 
        type: 'user/setError', 
        payload: 'Vui lòng điền đầy đủ thông tin địa chỉ' 
      });
      return;
    }
    
    dispatch(addAddress(addrForm));
    setAddrOpen(false);
    setAddrForm({ address: '', ward: '', district: '', province: '', is_default: false });
  };

  const handleEditAddress = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      address: addr.address || '',
      ward: addr.ward || '',
      district: addr.district || '',
      province: addr.province || '',
      is_default: addr.is_default || false
    });
    setAddrOpen(true);
  };

  const handleUpdateAddress = () => {
    if (!addrForm.address || !addrForm.ward || !addrForm.district || !addrForm.province) {
      dispatch({ 
        type: 'user/setError', 
        payload: 'Vui lòng điền đầy đủ thông tin địa chỉ' 
      });
      return;
    }
    
    dispatch(updateAddress({ 
      addressId: editingAddr._id, 
      addressData: addrForm 
    }));
    setAddrOpen(false);
    setEditingAddr(null);
    setAddrForm({ address: '', ward: '', district: '', province: '', is_default: false });
  };

  const handleDeleteAddress = (addr) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      dispatch(deleteAddress(addr._id));
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Đang tải thông tin...</Typography>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ mx: 'auto', mt: 0 }}>
        {/* Snackbar cho thông báo */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => dispatch(clearError())}
        >
          <Alert severity="error" onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => dispatch(clearSuccess())}
        >
          <Alert severity="success" onClose={() => dispatch(clearSuccess())}>
            {success}
          </Alert>
        </Snackbar>

        {/* Header với thông tin tổng quan */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: '#f5fafd', mb: 3 }}>
          <Typography
            variant="h4"
            color="primary"
            fontWeight={700}
            gutterBottom
          >
            Quản lý hồ sơ cá nhân
          </Typography>
          
          {/* Thẻ hiển thị thông tin nhanh */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  <AccountCircle color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {profile?.full_name || 'Chưa cập nhật'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Họ và tên
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#e8f5e8', textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  <Stars color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {formatLoyaltyPoints(profile?.loyalty_points)} điểm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm tích lũy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  <LocationOn color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {addresses?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ giao hàng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#fce4ec', textAlign: 'center' }}>
                <CardContent sx={{ py: 2 }}>
                  <Chip 
                    label={profile?.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                    color={profile?.status === 'active' ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontSize: 16, py: 2, px: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Trạng thái tài khoản
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />
          
          {/* Form chỉnh sửa thông tin */}
          <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 2 }}>
            Thông tin cá nhân
          </Typography>
          
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Họ tên"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                disabled={!editInfo}
                fullWidth
                InputProps={{
                  startAdornment: <AccountCircle sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Email"
                value={form.email}
                disabled
                fullWidth
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editInfo}
                fullWidth
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Tooltip title={editInfo ? 'Lưu thông tin' : 'Chỉnh sửa thông tin'}>
                  <IconButton
                    color={editInfo ? 'success' : 'primary'}
                    onClick={() =>
                      editInfo ? handleUpdateInfo() : setEditInfo(true)
                    }
                    disabled={loading}
                    size="large"
                  >
                    {editInfo ? <Save /> : <Edit />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Đổi mật khẩu">
                  <IconButton
                    color="secondary"
                    onClick={() => setPwOpen(true)}
                    size="large"
                  >
                    <Lock />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>

          {/* Thông tin loyalty points chi tiết */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2, border: '1px solid rgba(255, 193, 7, 0.3)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Stars color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Điểm tích lũy của bạn
              </Typography>
            </Box>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              {formatLoyaltyPoints(profile?.loyalty_points)} điểm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              💰 Quy đổi: 1 điểm = 1 VNĐ khi mua hàng <br />
              🎁 Tích điểm: 1,000 VNĐ = 100 điểm thưởng <br />
              ⭐ Sử dụng điểm để giảm giá khi thanh toán
            </Typography>
          </Box>
        </Paper>

        {/* Quản lý địa chỉ */}
        <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: '#f5fafd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight={600}>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Địa chỉ giao hàng ({addresses?.length || 0})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddLocationAlt />}
              onClick={() => {
                setEditingAddr(null);
                setAddrForm({ address: '', ward: '', district: '', province: '', is_default: false });
                setAddrOpen(true);
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </Box>

          {addresses && addresses.length > 0 ? (
            <List>
              {addresses.map((addr) => (
                <ListItem
                  key={addr._id}
                  sx={{
                    bgcolor: addr.is_default ? '#e3f2fd' : '#fff',
                    borderRadius: 2,
                    mb: 1,
                    border: addr.is_default ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    boxShadow: addr.is_default ? '0 2px 8px rgba(25,118,210,0.15)' : '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={addr.is_default ? 600 : 400}>
                          {`${addr.address}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                        </Typography>
                        {addr.is_default && (
                          <Chip 
                            label="Mặc định" 
                            color="primary" 
                            size="small" 
                            variant="filled"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      addr.is_default ? 
                        "Địa chỉ giao hàng mặc định" : 
                        "Địa chỉ giao hàng phụ"
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditAddress(addr)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteAddress(addr)}
                        disabled={addresses.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có địa chỉ giao hàng
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Thêm địa chỉ để tiện việc mua hàng
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Dialog đổi mật khẩu */}
        <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Lock sx={{ mr: 1 }} />
              Đổi mật khẩu
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Mật khẩu cũ"
              type="password"
              fullWidth
              margin="normal"
              value={pwForm.old_password}
              onChange={(e) =>
                setPwForm({ ...pwForm, old_password: e.target.value })
              }
              required
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              margin="normal"
              value={pwForm.new_password}
              onChange={(e) =>
                setPwForm({ ...pwForm, new_password: e.target.value })
              }
              required
              helperText="Mật khẩu phải có ít nhất 6 ký tự"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setPwOpen(false);
              setPwForm({ old_password: '', new_password: '' });
            }}>
              Hủy
            </Button>
            <Button 
              variant="contained" 
              onClick={handleChangePassword} 
              disabled={loading || !pwForm.old_password || !pwForm.new_password}
            >
              Đổi mật khẩu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog thêm/sửa địa chỉ */}
        <Dialog open={addrOpen} onClose={() => setAddrOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn sx={{ mr: 1 }} />
              {editingAddr ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Địa chỉ cụ thể"
                  fullWidth
                  value={addrForm.address}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, address: e.target.value })
                  }
                  required
                  placeholder="Ví dụ: Số 123, đường ABC..."
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Phường/Xã"
                  fullWidth
                  value={addrForm.ward}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, ward: e.target.value })
                  }
                  required
                  placeholder="Ví dụ: Phường 1"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Quận/Huyện"
                  fullWidth
                  value={addrForm.district}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, district: e.target.value })
                  }
                  required
                  placeholder="Ví dụ: Quận 1"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tỉnh/Thành phố"
                  fullWidth
                  value={addrForm.province}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, province: e.target.value })
                  }
                  required
                  placeholder="Ví dụ: TP.HCM"
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <input
                type="checkbox"
                checked={addrForm.is_default}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, is_default: e.target.checked })
                }
                id="is_default"
                style={{ marginRight: 8 }}
              />
              <label htmlFor="is_default">
                <Typography variant="body1">
                  Đặt làm địa chỉ giao hàng mặc định
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Địa chỉ này sẽ được chọn tự động khi đặt hàng
                </Typography>
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddrOpen(false);
              setEditingAddr(null);
              setAddrForm({ address: '', ward: '', district: '', province: '', is_default: false });
            }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={editingAddr ? handleUpdateAddress : handleAddAddress}
              disabled={loading || !addrForm.address || !addrForm.ward || !addrForm.district || !addrForm.province}
            >
              {editingAddr ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Profile;