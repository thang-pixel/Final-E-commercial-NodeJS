import React, { useState, useEffect } from 'react';
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
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  LocalOffer,
  Event,
  TrendingUp,
  People
} from '@mui/icons-material';
import axios from 'axios';
import { API_DOMAIN } from '../../../constants/apiDomain';
import CreatePromotionDialog from './CreatePromotionDialog';
import PromotionDetailDialog from './PromotionDetailDialog'; // KIỂM TRA: Import này
import { useNotification } from '../../../hooks/useNotification';
const PromotionList = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({});
  const { showSuccess, showError, NotificationComponent } = useNotification();
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    discount_type: ''
  });

  const token = localStorage.getItem("token");

  // Fetch promotions
  const fetchPromotions = async (filterParams = filters) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API_DOMAIN}/api/promotions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPromotions(response.data.data);
        setMeta(response.data.meta);
      } else {
        setError('Không thể tải danh sách mã giảm giá');
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
      page: 1
    };
    setFilters(newFilters);
    fetchPromotions(newFilters);
  };

  const handlePageChange = (event, page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchPromotions(newFilters);
  };

  const handleViewDetail = async (promotion) => {
    try {
      setLoading(true); // Thêm loading state
      const response = await axios.get(`${API_DOMAIN}/api/promotions/${promotion._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log('Promotion detail loaded:', response.data.data); // Debug log
        setSelectedPromotion(response.data.data);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching promotion detail:', error);
      showError(error.response?.data?.message || 'Lỗi khi tải chi tiết mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotion) => {
    

    try {
      await axios.delete(`${API_DOMAIN}/api/promotions/${promotion._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showSuccess('Xóa mã giảm giá thành công');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      showError(error.response?.data?.message || 'Lỗi khi xóa mã giảm giá');
    }
  };

  // Utility functions
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

  const getStatusColor = (promotion) => {
    if (!promotion.is_valid) return 'error';
    const now = new Date();
    const endDate = new Date(promotion.end_date);
    if (endDate < now) return 'error';
    if (promotion.status === 'ACTIVE') return 'success';
    return 'default';
  };

  const getStatusLabel = (promotion) => {
    const now = new Date();
    const endDate = new Date(promotion.end_date);
    if (endDate < now) return 'Đã hết hạn';
    if (!promotion.is_valid) return 'Không khả dụng';
    if (promotion.status === 'ACTIVE') return 'Đang hoạt động';
    return promotion.status;
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
          <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
          Quản lý mã giảm giá
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Tạo mã giảm giá mới
        </Button>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalOffer color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{meta.totalItems || 0}</Typography>
                  <Typography variant="caption">Tổng mã giảm giá</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {promotions.filter(p => p.is_valid).length}
                  </Typography>
                  <Typography variant="caption">Đang hoạt động</Typography>
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm mã hoặc tên..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx ={{ minWidth: '150px' }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Tạm dừng</MenuItem>
                <MenuItem value="EXPIRED">Hết hạn</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" sx = {{ minWidth: '150px' }}>
              <InputLabel>Loại giảm giá</InputLabel>
              <Select
                value={filters.discount_type}
                onChange={(e) => handleFilterChange('discount_type', e.target.value)}
                label="Loại giảm giá"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PERCENTAGE">Phần trăm</MenuItem>
                <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                <TableCell>Mã giảm giá</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá trị</TableCell>
                <TableCell>Sử dụng</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Trạng thái</TableCell>
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
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Chưa có mã giảm giá nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promotion) => (
                  <TableRow key={promotion._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {promotion.code}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {promotion.name}
                      </Typography>
                      {promotion.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {promotion.description.length > 50 
                            ? `${promotion.description.substring(0, 50)}...` 
                            : promotion.description}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={promotion.discount_type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                        size="small"
                        color={promotion.discount_type === 'PERCENTAGE' ? 'info' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {promotion.discount_type === 'PERCENTAGE' 
                          ? `${promotion.discount_value}%`
                          : formatPrice(promotion.discount_value)
                        }
                      </Typography>
                      {promotion.max_discount_amount && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Tối đa {formatPrice(promotion.max_discount_amount)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {promotion.used_count}/{promotion.usage_limit || '∞'}
                      </Typography>
                      {promotion.orders_used_count !== undefined && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {promotion.orders_used_count} đơn hàng
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(promotion.start_date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        đến {formatDate(promotion.end_date)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(promotion)}
                        color={getStatusColor(promotion)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewDetail(promotion)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Xóa">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(promotion)}
                          size="small"
                          
                        >
                          <Delete />
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

      {/* Create Dialog */}
      <CreatePromotionDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          setCreateDialogOpen(false);
          fetchPromotions();
        }}
      />

      {/* Detail Dialog - KIỂM TRA: Render conditional */}
      {selectedPromotion && (
        <PromotionDetailDialog
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedPromotion(null); // Reset selected promotion
          }}
          promotion={selectedPromotion}
        />
      )}
    </Box>
  );
};

export default PromotionList;