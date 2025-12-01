import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import {
  ArrowBack,
  Schedule,
  Assignment,
  LocalShipping,
  CheckCircle,
  Cancel,
  Phone,
  LocationOn,
  Payment,
  Note,
  Edit,
  Person,
  ShoppingBag
} from '@mui/icons-material';
import axios from 'axios';
import { API_DOMAIN } from '../../../constants/apiDomain';

// Status mapping (same as previous)
const ORDER_STATUS = {
  'PENDING': { 
    label: 'Chờ xử lý', 
    color: 'warning', 
    icon: <Schedule />,
    timelineColor: 'warning'
  },
  'CONFIRMED': { 
    label: 'Đã xác nhận', 
    color: 'info', 
    icon: <Assignment />,
    timelineColor: 'primary'
  },
  'PROCESSING': { 
    label: 'Đang xử lý', 
    color: 'primary', 
    icon: <Assignment />,
    timelineColor: 'primary'
  },
  'SHIPPING': { 
    label: 'Đang giao', 
    color: 'secondary', 
    icon: <LocalShipping />,
    timelineColor: 'secondary'
  },
  'DELIVERED': { 
    label: 'Đã giao', 
    color: 'success', 
    icon: <CheckCircle />,
    timelineColor: 'success'
  },
  'CANCELLED': { 
    label: 'Đã hủy', 
    color: 'error', 
    icon: <Cancel />,
    timelineColor: 'error'
  },
  'REFUNDED': { 
    label: 'Đã hoàn tiền', 
    color: 'default', 
    icon: <Cancel />,
    timelineColor: 'grey'
  }
};

const PAYMENT_METHOD = {
  'COD': 'Thanh toán khi nhận hàng',
  'VNPAY': 'VNPay',
  'BANK_TRANSFER': 'Chuyển khoản ngân hàng',
  'CREDIT_CARD': 'Thẻ tín dụng',
  'E_WALLET': 'Ví điện tử'
};

function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_DOMAIN}/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.patch(
        `${API_DOMAIN}/api/orders/${orderId}/status`,
        {
          status: newStatus,
          note: statusNote
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatusDialogOpen(false);
      setNewStatus('');
      setStatusNote('');
      
      // Refresh order data
      fetchOrderDetail();
      
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const openStatusDialog = () => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/orders')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Không tìm thấy đơn hàng</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/orders')}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/orders')}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4">
            Chi tiết đơn hàng #{order.order_number}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={openStatusDialog}
          >
            Cập nhật trạng thái
          </Button>
          
          {ORDER_STATUS[order.status]?.icon}
          <Chip 
            label={ORDER_STATUS[order.status]?.label || order.status}
            color={ORDER_STATUS[order.status]?.color || 'default'}
            size="medium"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Thông tin khách hàng
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.customer_id.full_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">
                    {order.customer_id.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Số điện thoại:</Typography>
                  <Typography variant="body1">
                    {order.customer_id.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Ngày đặt hàng:</Typography>
                  <Typography variant="body1">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Lịch sử trạng thái
              </Typography>
              
              <Timeline>
                {order.status_history
                  .slice()
                  .reverse()
                  .map((history, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot 
                          color={ORDER_STATUS[history.status]?.timelineColor || 'grey'}
                          variant={index === 0 ? 'filled' : 'outlined'}
                        >
                          {ORDER_STATUS[history.status]?.icon || <Assignment />}
                        </TimelineDot>
                        {index < order.status_history.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                          {ORDER_STATUS[history.status]?.label || history.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(history.timestamp)}
                        </Typography>
                        {history.note && (
                          <Typography variant="body2" color="text.secondary">
                            {history.note}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
              </Timeline>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ShoppingBag sx={{ mr: 1 }} />
                Sản phẩm ({order.items.length} sản phẩm)
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Đơn giá</TableCell>
                      <TableCell align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              component="img"
                              src={item.image_url}
                              alt={item.name}
                              sx={{ 
                                width: 60, 
                                height: 60, 
                                objectFit: 'cover', 
                                mr: 2,
                                borderRadius: 1 
                              }}
                            />
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {item.SKU}
                              </Typography>
                              {item.attributes && item.attributes.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  {item.attributes.map(attr => `${attr.code}: ${attr.value}`).join(', ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.quantity} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {formatPrice(item.total_price)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tóm tắt đơn hàng
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{formatPrice(order.subtotal)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>
                  {order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}
                </Typography>
              </Box>

              {order.discount_amount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá:</Typography>
                  <Typography color="success.main">
                    -{formatPrice(order.discount_amount)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="error">
                  {formatPrice(order.total_amount)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1 }} />
                Địa chỉ giao hàng
              </Typography>
              
              <Typography variant="body1" fontWeight={600}>
                {order.shipping_address.full_name}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Phone sx={{ mr: 1, fontSize: 16 }} />
                {order.shipping_address.phone}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {order.shipping_address.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  order.shipping_address.ward,
                  order.shipping_address.district,
                  order.shipping_address.province
                ].filter(Boolean).join(', ')}
              </Typography>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} />
                Thanh toán
              </Typography>
              
              <Typography variant="body1">
                {PAYMENT_METHOD[order.payment_method] || order.payment_method}
              </Typography>
              
              {order.customer_note && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Ghi chú:
                  </Typography>
                  <Typography variant="body2">
                    {order.customer_note}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Đơn hàng: <strong>#{order.order_number}</strong>
            </Typography>
          </Box>
          
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
  );
}

export default AdminOrderDetail;