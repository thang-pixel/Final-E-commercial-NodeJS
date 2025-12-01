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
  Alert
} from '@mui/material';
import { Edit, Delete, AddLocationAlt, Save, Lock } from '@mui/icons-material';
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
    dispatch(changeMyPassword(pwForm));
    setPwOpen(false);
    setPwForm({ old_password: '', new_password: '' });
  };

  // Address CRUD
  const handleAddAddress = () => {
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

        <Paper elevation={4} sx={{ p: 2, borderRadius: 3, bgcolor: '#f5fafd' }}>
          <Typography
            variant="h4"
            color="primary"
            fontWeight={700}
            gutterBottom
          >
            Quản lý hồ sơ cá nhân
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Họ tên"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                disabled={!editInfo}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Email"
                value={form.email}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={!editInfo}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center'}}>
              <Tooltip title={editInfo ? 'Lưu' : 'Chỉnh sửa'}>
                <IconButton
                  color={editInfo ? 'success' : 'primary'}
                  onClick={() =>
                    editInfo ? handleUpdateInfo() : setEditInfo(true)
                  }
                  disabled={loading}
                >
                  {editInfo ? <Save /> : <Edit />}
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Lock />}
              onClick={() => setPwOpen(true)}
            >
              Đổi mật khẩu
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" color="primary" fontWeight={600}>
              Địa chỉ giao hàng ({addresses.length})
            </Typography>
            <List>
              {addresses?.map((addr) => (
                <ListItem
                  key={addr._id}
                  sx={{
                    bgcolor: addr.is_default ? '#e3f2fd' : '#fff',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={`${addr.address}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                    secondary={addr.is_default ? 'Địa chỉ mặc định' : ''}
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
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
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
        </Paper>

        {/* Đổi mật khẩu */}
        <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPwOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleChangePassword} disabled={loading}>
              Đổi mật khẩu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Thêm/Sửa địa chỉ */}
        <Dialog open={addrOpen} onClose={() => setAddrOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingAddr ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Địa chỉ"
                  fullWidth
                  value={addrForm.address}
                  onChange={(e) =>
                    setAddrForm({ ...addrForm, address: e.target.value })
                  }
                  required
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
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <input
                type="checkbox"
                checked={addrForm.is_default}
                onChange={(e) =>
                  setAddrForm({ ...addrForm, is_default: e.target.checked })
                }
                id="is_default"
              />
              <label htmlFor="is_default" style={{ marginLeft: 8 }}>
                Đặt làm địa chỉ mặc định
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddrOpen(false)}>Hủy</Button>
            <Button
              variant="contained"
              onClick={editingAddr ? handleUpdateAddress : handleAddAddress}
              disabled={loading}
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