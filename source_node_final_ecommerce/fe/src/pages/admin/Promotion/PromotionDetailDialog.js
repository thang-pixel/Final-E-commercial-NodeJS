import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  LocalOffer,
  Event,
  TrendingUp,
  Receipt,
  Person,
  AttachMoney,
  Schedule
} from '@mui/icons-material';

const PromotionDetailDialog = ({ open, onClose, promotion }) => {
  if (!promotion) return null;

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDiscountTypeLabel = (type) => {
    return type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định';
  };

  const { promotion: promotionData, orders_used, statistics } = promotion;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Chi tiết mã giảm giá: {promotionData.code}
            </Typography>
          </Box>
          <Chip
            label={promotionData.status}
            color={getStatusColor(promotionData.status)}
            size="medium"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Basic Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocalOffer sx={{ mr: 1 }} />
              Thông tin cơ bản
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Mã giảm giá:</Typography>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {promotionData.code}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Tên:</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {promotionData.name}
                </Typography>
              </Grid>
              
              {promotionData.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Mô tả:</Typography>
                  <Typography variant="body1">
                    {promotionData.description}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Loại giảm giá:</Typography>
                <Chip 
                  label={getDiscountTypeLabel(promotionData.discount_type)}
                  color={promotionData.discount_type === 'PERCENTAGE' ? 'info' : 'secondary'}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Giá trị giảm:</Typography>
                <Typography variant="h6" color="error">
                  {promotionData.discount_type === 'PERCENTAGE' 
                    ? `${promotionData.discount_value}%`
                    : formatPrice(promotionData.discount_value)
                  }
                </Typography>
              </Grid>
              
              {promotionData.max_discount_amount && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Giảm tối đa:</Typography>
                  <Typography variant="body1" color="error">
                    {formatPrice(promotionData.max_discount_amount)}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Đơn hàng tối thiểu:</Typography>
                <Typography variant="body1">
                  {formatPrice(promotionData.min_order_amount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Người tạo:</Typography>
                <Typography variant="body1">
                  {promotionData.created_by?.full_name || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày tạo:</Typography>
                <Typography variant="body1">
                  {formatDate(promotionData.createdAt)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Time Range */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1 }} />
              Thời gian hiệu lực
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày bắt đầu:</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(promotionData.start_date)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ngày kết thúc:</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(promotionData.end_date)}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Status warning */}
            {new Date(promotionData.end_date) < new Date() && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Mã giảm giá này đã hết hạn
              </Alert>
            )}
            
            {new Date(promotionData.start_date) > new Date() && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Mã giảm giá này chưa có hiệu lực
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1 }} />
              Thống kê sử dụng
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Receipt color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {statistics?.total_orders || 0}
                    </Typography>
                    <Typography variant="caption">Đơn hàng sử dụng</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {formatPrice(statistics?.total_discount_given || 0)}
                    </Typography>
                    <Typography variant="caption">Tổng tiền đã giảm</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {promotionData.used_count}
                    </Typography>
                    <Typography variant="caption">Lượt sử dụng</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Event color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" color="secondary.main">
                      {statistics?.remaining_usage !== null ? statistics.remaining_usage : '∞'}
                    </Typography>
                    <Typography variant="caption">Lượt còn lại</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {promotionData.usage_limit && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tiến độ sử dụng: {promotionData.used_count}/{promotionData.usage_limit}
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  backgroundColor: 'grey.200',
                  borderRadius: 1,
                  mt: 1
                }}>
                  <Box sx={{
                    width: `${(promotionData.used_count / promotionData.usage_limit) * 100}%`,
                    height: '100%',
                    backgroundColor: 'primary.main',
                    borderRadius: 1
                  }} />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1 }} />
              Danh sách đơn hàng đã sử dụng ({orders_used?.length || 0})
            </Typography>
            
            {orders_used && orders_used.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn hàng</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell align="right">Tổng tiền</TableCell>
                      <TableCell align="right">Giảm giá</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders_used.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            #{order.order_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {order.customer_id?.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customer_id?.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatPrice(order.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            -{formatPrice(order.promotion_used?.discount_amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.createdAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Chưa có đơn hàng nào sử dụng mã giảm giá này
              </Alert>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromotionDetailDialog; 