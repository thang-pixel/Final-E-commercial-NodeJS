import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  InputAdornment
} from '@mui/material';
import {
  Visibility,
  Search,
  FilterList,
  Assignment,
  Schedule,
  LocalShipping,
  CheckCircle,
  Cancel,
  Person,
  ShoppingCart,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';
import { API_DOMAIN } from '../../../constants/apiDomain';

// Status mapping
const ORDER_STATUS = {
  'PENDING': { label: 'Chờ xử lý', color: 'warning', icon: <Schedule /> },
  'CONFIRMED': { label: 'Đã xác nhận', color: 'info', icon: <Assignment /> },
  'PROCESSING': { label: 'Đang xử lý', color: 'primary', icon: <Assignment /> },
  'SHIPPING': { label: 'Đang giao', color: 'secondary', icon: <LocalShipping /> },
  'DELIVERED': { label: 'Đã giao', color: 'success', icon: <CheckCircle /> },
  'CANCELLED': { label: 'Đã hủy', color: 'error', icon: <Cancel /> },
  'REFUNDED': { label: 'Đã hoàn tiền', color: 'default', icon: <Cancel /> }
};

const PAYMENT_METHODS = {
  'COD': 'Thanh toán khi nhận',
  'VNPAY': 'VNPay',
  'BANK_TRANSFER': 'Chuyển khoản',
  'CREDIT_CARD': 'Thẻ tín dụng',
  'E_WALLET': 'Ví điện tử'
};

const DATE_RANGES = [
  { value: '', label: 'Tất cả' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'custom', label: 'Tùy chỉnh' }
];

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    date_range: '',
    start_date: '',
    end_date: '',
    search: ''
  });

  const token = localStorage.getItem("token");

  // Fetch orders
  const fetchOrders = async (filterParams = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API_DOMAIN}/api/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setMeta(response.data.meta);
      } else {
        setError('Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
      page: 1 // Reset về trang 1
    };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  const handlePageChange = (event, page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  const handleSearch = () => {
    fetchOrders({ ...filters, page: 1 });
  };

  const clearFilters = () => {
    const newFilters = {
      page: 1,
      limit: 20,
      status: '',
      date_range: '',
      start_date: '',
      end_date: '',
      search: ''
    };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  // View order detail
  const handleViewDetail = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Update order status
  const handleStatusUpdate = async () => {
    try {
      await axios.patch(
        `${API_DOMAIN}/api/orders/${selectedOrder._id}/status`,
        {
          status: newStatus,
          note: statusNote
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      
      // Refresh data
      fetchOrders();
      
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Fade in>
      <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
            <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quản lý đơn hàng
          </Typography>
          
          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingCart color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{meta.totalItems || 0}</Typography>
                    <Typography variant="caption">Tổng đơn hàng</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            Bộ lọc
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm đơn hàng, khách hàng..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small" sx={{ minWidth: '150px' }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {Object.entries(ORDER_STATUS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small" sx={{ minWidth: '150px' }}>
                <InputLabel>Thời gian</InputLabel>
                <Select
                  value={filters.date_range}
                  onChange={(e) => handleFilterChange('date_range', e.target.value)}
                  label="Thời gian"
                >
                  {DATE_RANGES.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Date Range */}
            {filters.date_range === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Từ ngày"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Đến ngày"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Action Buttons */}
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                fullWidth
              >
                Tìm
              </Button>
            </Grid>
            
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Orders Table */}
        <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell>Mã đơn hàng</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell align="right">Tổng tiền</TableCell>
                  <TableCell>Thanh toán</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không có đơn hàng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          #{order.order_number}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {order.customer.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customer.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <Avatar
                              key={idx}
                              src={item.image_url}
                              variant="rounded"
                              sx={{ width: 32, height: 32 }}
                            />
                          ))}
                          {order.items.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{order.items.length - 2}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="error">
                          {formatPrice(order.total_amount)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={PAYMENT_METHODS[order.payment_method] || order.payment_method}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={ORDER_STATUS[order.status]?.label || order.status}
                          color={ORDER_STATUS[order.status]?.color || 'default'}
                          size="small"
                          icon={ORDER_STATUS[order.status]?.icon}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Xem chi tiết">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleViewDetail(order._id)}
                            size="small"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Cập nhật trạng thái">
                          <IconButton 
                            color="secondary" 
                            onClick={() => openStatusDialog(order)}
                            size="small"
                          >
                            <Assignment />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={meta.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Paper>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Đơn hàng: <strong>#{selectedOrder.order_number}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Khách hàng: <strong>{selectedOrder.customer.full_name}</strong>
                </Typography>
              </Box>
            )}
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Trạng thái mới</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Trạng thái mới"
              >
                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {value.icon}
                      {value.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              placeholder="Nhập ghi chú về việc cập nhật trạng thái..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleStatusUpdate} disabled={!newStatus}>
              Cập nhật
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default OrderList;