import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Fade
} from "@mui/material";
import { Edit, Block, CheckCircle, Person } from "@mui/icons-material";
import axios from "axios";
import { API_DOMAIN } from "../../../constants/apiDomain";

const CustomerList = () => {
  const [users, setUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });

  const token = localStorage.getItem("token");

   // Fetch all users
  useEffect(() => {
    axios.get(`${API_DOMAIN}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      // Backend trả về { success: true, data: users }
      if (res.data.success) {
        setUsers(res.data.data);
      } else {
        setUsers(res.data); // fallback nếu format khác
      }
    }).catch(err => {
      console.error('Error fetching users:', err);
    });
  }, [editOpen, token]);

  // Open edit dialog
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ full_name: user.full_name, phone: user.phone });
    setEditOpen(true);
  };

  // Update user info
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_DOMAIN}/api/users/${selectedUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditOpen(false);
      // Refresh data
      window.location.reload(); // hoặc fetch lại data
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Ban user
  const handleBan = async (user) => {
    await axios.patch(`${API_DOMAIN}/api/users/${user._id}/ban`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(users.map(u => u._id === user._id ? { ...u, status: "inactive" } : u));
  };

  // Unban user
  const handleUnban = async (user) => {
    await axios.patch(`${API_DOMAIN}/api/users/${user._id}/unban`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(users.map(u => u._id === user._id ? { ...u, status: "active" } : u));
  };

  return (
    <Fade in>
      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
          Danh sách khách hàng
        </Typography>
        <Paper elevation={4} sx={{ p: 2, borderRadius: 3, bgcolor: "#f5fafd" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell>STT</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>SĐT</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Person color="info" />
                        <Typography fontWeight={500}>{user.full_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip label={user.role} color={user.role === "admin" ? "warning" : "primary"} />
                    </TableCell>
                    <TableCell>
                      {user.status === "active" ? (
                        <Chip label="Hoạt động" color="success" icon={<CheckCircle />} />
                      ) : (
                        <Chip label="Bị khóa" color="error" icon={<Block />} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton color="primary" onClick={() => handleEdit(user)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {user.status === "active" ? (
                        <Tooltip title="Khóa tài khoản">
                          <IconButton color="error" onClick={() => handleBan(user)}>
                            <Block />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mở khóa tài khoản">
                          <IconButton color="success" onClick={() => handleUnban(user)}>
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Edit dialog */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
          <DialogContent>
            <TextField
              label="Họ tên"
              fullWidth
              margin="normal"
              value={editForm.full_name}
              onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
            />
            <TextField
              label="Số điện thoại"
              fullWidth
              margin="normal"
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleUpdate}>Lưu</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default CustomerList;