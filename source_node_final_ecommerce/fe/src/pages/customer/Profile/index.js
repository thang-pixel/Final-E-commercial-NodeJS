import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Edit, Delete, AddLocationAlt, Save, Lock } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, changePassword, fetchProfile, addAddress, updateAddress, deleteAddress } from "../../../redux/actions/userAction";

const Profile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [editInfo, setEditInfo] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password change dialog
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "" });

  // Address dialog
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: "", is_default: false });
  const [editingAddr, setEditingAddr] = useState(null);

  // Load user info on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  // Update info
  const handleUpdateInfo = () => {
    dispatch(updateProfile(form));
    setEditInfo(false);
  };

  // Change password
  const handleChangePassword = () => {
    dispatch(changePassword(pwForm));
    setPwOpen(false);
    setPwForm({ old_password: "", new_password: "" });
  };

  // Address CRUD
  const handleAddAddress = () => {
    dispatch(addAddress(addrForm));
    setAddrOpen(false);
    setAddrForm({ name: "", is_default: false });
  };
  const handleEditAddress = (addr) => {

    setEditingAddr(addr);
    setAddrForm(addr);
    setAddrOpen(true);
  };
  const handleUpdateAddress = () => {
    dispatch(updateAddress(editingAddr, addrForm));
    setAddrOpen(false);
    setEditingAddr(null);
    setAddrForm({ name: "", is_default: false });
  };
  const handleDeleteAddress = (addr) => {
    dispatch(deleteAddress(addr));
  };

  return (
    <Fade in>
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 4 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: "#f5fafd" }}>
          <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
            Quản lý hồ sơ cá nhân
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="Họ tên"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              disabled={!editInfo}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              value={form.email}
              disabled
              sx={{ flex: 1 }}
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editInfo}
              sx={{ flex: 1 }}
            />
            <Tooltip title={editInfo ? "Lưu" : "Chỉnh sửa"}>
              <IconButton
                color={editInfo ? "success" : "primary"}
                onClick={() => (editInfo ? handleUpdateInfo() : setEditInfo(true))}
              >
                {editInfo ? <Save /> : <Edit />}
              </IconButton>
            </Tooltip>
          </Box>
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
              Địa chỉ giao hàng
            </Typography>
            <List>
              {user?.addresses?.map((addr, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    bgcolor: addr.is_default ? "#e3f2fd" : "#fff",
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={addr.name}
                    secondary={addr.is_default ? "Mặc định" : ""}
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
                setAddrForm({ name: "", is_default: false });
                setAddrOpen(true);
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </Box>
        </Paper>

        {/* Đổi mật khẩu */}
        <Dialog open={pwOpen} onClose={() => setPwOpen(false)}>
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
            <Button variant="contained" onClick={handleChangePassword}>
              Đổi mật khẩu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Thêm/Sửa địa chỉ */}
        <Dialog open={addrOpen} onClose={() => setAddrOpen(false)}>
          <DialogTitle>
            {editingAddr ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
          </DialogTitle>
          <DialogContent>
            <TextField
              label="Tên địa chỉ"
              fullWidth
              margin="normal"
              value={addrForm.name}
              onChange={(e) =>
                setAddrForm({ ...addrForm, name: e.target.value })
              }
            />
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
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
            >
              {editingAddr ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Profile;