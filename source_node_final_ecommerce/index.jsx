import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProductActivityHistory } from '../../../redux/action/activityAction';
// Components
import AddProductPopup from '../../../components/AddProductPopup';
import NotificationSnackbar from '../../../components/NotificationSnackbar';
import ConfirmDialog from '../../../components/ConfirmDialog';
import ProductHistoryDialog from '../../../components/ProductHistoryDialog';

// Redux actions
import { setSearchFilter, setStockFilter } from '../../../redux/reducers/inventorySlice';
import { createImportOrder, createExportOrder } from '../../../redux/action/orderAction';
import { fetchInventoryItems, deleteMultipleProducts } from '../../../redux/action/inventory';

// Hooks
import { useNotification } from '../../../hooks/useNotification';
import { useConfirm } from '../../../hooks/useConfirm';

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Stack,
  Fade,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Memoized components for statistics cards
const StatCard = React.memo(({ title, value, icon, color = "primary" }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={600}>
            {value}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
));

// Memoized cell renderers
const ImageCell = React.memo(({ src, alt }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    }}
  >
    <Box
      component="img"
      src={src || '/img/default.png'}
      alt={alt}
      sx={{
        width: 45,
        height: 45,
        objectFit: 'cover',
        borderRadius: 1,
      }}
    />
  </Box>
));

const CategoryChip = React.memo(({ value }) => (
  <Chip 
    label={value || 'Chưa phân loại'} 
    size="small" 
    variant="outlined"
    color="primary"
  />
));

const SupplierChip = React.memo(({ value }) => (
  <Chip 
    label={value || 'Chưa có'} 
    size="small" 
    variant="outlined"
    color="secondary"
    icon={<BusinessIcon fontSize="small" />}
  />
));

const PriceCell = React.memo(({ value, color = "text.primary" }) => (
  <Typography variant="body2" color={color} fontWeight={color === "success.main" ? 600 : 400}>
    {value.toLocaleString('vi-VN')}đ
  </Typography>
));

const StockChip = React.memo(({ stock, onClick, productInfo }) => {
  const { color, icon, variant } = useMemo(() => {
    if (stock === 0) {
      return { color: 'error', icon: <WarningIcon fontSize="small" />, variant: 'filled' };
    } else if (stock <= 10) {
      return { color: 'warning', icon: <TrendingDownIcon fontSize="small" />, variant: 'outlined' };
    }
    return { color: 'success', icon: <TrendingUpIcon fontSize="small" />, variant: 'outlined' };
  }, [stock]);

  return (
    <Tooltip title="Nhấp để xem lịch sử xuất nhập kho" placement="top">
      <Chip
        icon={icon}
        label={stock}
        size="small"
        color={color}
        variant={variant}
        onClick={() => onClick && onClick(productInfo)}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: onClick ? `${color}.100` : 'inherit',
            transform: onClick ? 'scale(1.05)' : 'none',
            boxShadow: onClick ? 2 : 'none'
          }
        }}
      />
    </Tooltip>
  );
});

const DateCell = React.memo(({ value, productId, historyMap }) => {
  const { formattedDate, updateType } = useMemo(() => {
    if (!value) return { formattedDate: '', updateType: '' };
    
    // Xử lý cả Date object và string
    const date = value instanceof Date ? value : new Date(value);
    
    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) return { formattedDate: '', updateType: '' };
    
    // Format theo định dạng Việt Nam: dd/mm/yyyy hh:mm
    const formatted = date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Tìm loại cập nhật cuối cùng
    let updateType = 'Tạo mới';
    if (productId && historyMap && historyMap[productId]) {
      const history = historyMap[productId];
      if (history.logs && history.logs.length > 0) {
        const latestLog = history.logs.reduce((latest, log) => {
          const logDate = new Date(log.timestamp);
          const latestDate = new Date(latest.timestamp);
          return logDate > latestDate ? log : latest;
        }, history.logs[0]);

        // Mapping action to Vietnamese
        const actionMap = {
          create_import_order: 'Tạo đơn nhập',
          submit_import_order: 'Gửi đơn nhập',
          create_warehouse_receipt: 'Nhập kho',
          create_export_order: 'Tạo đơn xuất',
          approve_export_order: 'Xuất kho',
          update_product: 'Cập nhật SP'
        };
        updateType = actionMap[latestLog.action] || 'Cập nhật';
      }
    }
    
    return { formattedDate: formatted, updateType };
  }, [value, productId, historyMap]);

  return (
    <Box textAlign="center">
      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
        {formattedDate}
      </Typography>
      <Typography 
        variant="caption" 
        sx={{ 
          fontSize: '0.75rem',
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1
        }}
      >
        {updateType}
      </Typography>
    </Box>
  );
});

// Component hiển thị nút actions khi có selection
const SelectionActions = React.memo(({ selectedCount, onExport, onPrintLabels, onImport, onDelete }) => (
  <Fade in={selectedCount > 0}>
    <Stack direction="row" spacing={2}>
      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        Đã chọn: <strong>{selectedCount}</strong> sản phẩm
      </Typography>
      <Button
        variant="contained"
        startIcon={<ExportIcon />}
        onClick={onExport}
        sx={{ textTransform: 'none' }}
        color="warning"
      >
        Xuất hàng
      </Button>
      <Button
        variant="contained"
        startIcon={<ShoppingCartIcon />}
        onClick={onImport}
        sx={{ textTransform: 'none' }}
        color="success"
      >
        Nhập hàng
      </Button>
      <Button
        variant="contained"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        sx={{ textTransform: 'none' }}
        color="error"
      >
        Xóa ({selectedCount})
      </Button>
    </Stack>
  </Fade>
));

// Component hiển thị nút actions mặc định
const DefaultActions = React.memo(({ onAddNew, onImport, onExport }) => (
  <Stack direction="row" spacing={2}>
    
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onAddNew}
      sx={{ textTransform: 'none' }}
    >
      Thêm sản phẩm
    </Button>
  </Stack>
));

function Inventory() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { items, loading, error, filters } = useSelector((state) => state.inventory);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [openPopup, setOpenPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectionModel, setSelectionModel] = useState([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productHistoryMap, setProductHistoryMap] = useState({}); 
  // Hooks
  const {
    notification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useNotification();

  const {
    confirmState,
    showConfirm,
    hideConfirm,
    setLoading: setConfirmLoading
  } = useConfirm();

  // Load data on mount
  useEffect(() => {
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  // Fetch history data cho tất cả sản phẩm
  useEffect(() => {
    const fetchAllProductHistory = async () => {
      if (items.length === 0) return;
      
      const historyPromises = items.map(async (item) => {
        try {
          const historyData = await dispatch(getProductActivityHistory(item._id));
          return { productId: item._id, historyData };
        } catch (error) {
          console.error(`Error fetching history for product ${item._id}:`, error);
          return { productId: item._id, historyData: null };
        }
      });

      const results = await Promise.allSettled(historyPromises);
      const historyMap = {};
      
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.historyData) {
          historyMap[result.value.productId] = result.value.historyData;
        }
      });
      
      setProductHistoryMap(historyMap);
    };

    fetchAllProductHistory();
  }, [items, dispatch]);


  // Function để lấy ngày cập nhật cuối cùng từ history
  const getLastUpdatedDate = useCallback((productId) => {
    const history = productHistoryMap[productId];
    if (!history || !history.logs || history.logs.length === 0) {
      // Nếu không có lịch sử, trả về ngày tạo ban đầu
      const product = items.find(item => item._id === productId);
      return product?.createdAt || new Date();
    }

    // Lấy timestamp mới nhất từ logs
    const latestLog = history.logs.reduce((latest, log) => {
      const logDate = new Date(log.timestamp);
      const latestDate = new Date(latest.timestamp);
      return logDate > latestDate ? log : latest;
    }, history.logs[0]);

    return latestLog.timestamp;
  }, [productHistoryMap, items]);


  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(filters.search.toLowerCase()));
      
      let matchStock = true;
      if (filters.stockStatus === 'in-stock') {
        matchStock = item.stock > 0;
      } else if (filters.stockStatus === 'out-of-stock') {
        matchStock = item.stock === 0;
      }

      return matchSearch && matchStock;
    });
  }, [items, filters.search, filters.stockStatus]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);
    const lowStockItems = items.filter(item => item.stock <= 10).length;
    const outOfStockItems = items.filter(item => item.stock === 0).length;

    return { totalStock, totalValue, lowStockItems, outOfStockItems };
  }, [items]);

  // Event handlers
  const handleSearch = useCallback((e) => {
    dispatch(setSearchFilter(e.target.value));
  }, [dispatch]);

  const handleStockFilter = useCallback((status) => {
    dispatch(setStockFilter(status));
  }, [dispatch]);

  const handleAddSuccess = useCallback(() => {
    dispatch(fetchInventoryItems());
    showSuccess('Sản phẩm đã được thêm/cập nhật thành công!');
  }, [dispatch, showSuccess]);

  const handleRowClick = useCallback((params, event) => {
    // Ngăn không cho mở popup khi click vào checkbox hoặc stock chip
    if (event.target.type === 'checkbox' || event.target.closest('[data-testid="stock-chip"]')) {
      return;
    }
    setEditingItem(params.row);
    setOpenPopup(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setOpenPopup(false);
    setEditingItem(null);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setOpenPopup(true);
  }, []);

  const handleSelectionChange = useCallback((newSelection) => {
    setSelectionModel(newSelection);
  }, []);

  // Stock history dialog handlers
  const handleStockClick = useCallback((product, event) => {
    event.stopPropagation();
    setSelectedProduct(product);
    setHistoryDialogOpen(true);
  }, []);

  const handleCloseHistoryDialog = useCallback(() => {
    setHistoryDialogOpen(false);
    setSelectedProduct(null);
  }, []);

  // Selection action handlers
  const handleExportSelected = useCallback(() => {
    const selectedItems = filteredItems.filter(item => selectionModel.includes(item._id));
    
    if (selectedItems.length === 0) {
      showWarning('Vui lòng chọn ít nhất một sản phẩm để xuất hàng');
      return;
    }
    
    // Kiểm tra tồn kho
    const outOfStockItems = selectedItems.filter(item => item.stock === 0);
    if (outOfStockItems.length > 0) {
      showError(
        `Không thể xuất hàng! Các sản phẩm sau đã hết hàng: ${outOfStockItems.map(item => item.name).join(', ')}`,
        'Kiểm tra tồn kho',
        10000
      );
      return;
    }
    
    dispatch(createExportOrder(selectedItems));
    showSuccess(`Đã chọn ${selectedItems.length} sản phẩm để xuất hàng!`);
    navigate('/user/order-export');
  }, [selectionModel, filteredItems, dispatch, navigate, showWarning, showError, showSuccess]);

  const handleImportSelected = useCallback(() => {
    const selectedItems = filteredItems.filter(item => selectionModel.includes(item._id));
    
    if (selectedItems.length === 0) {
      showWarning('Vui lòng chọn ít nhất một sản phẩm để nhập hàng');
      return;
    }
    
    dispatch(createImportOrder(selectedItems));

    navigate('/user/order');
  }, [selectionModel, filteredItems, dispatch, navigate, showWarning, showSuccess]);

  const handleDeleteSelected = useCallback(async () => {
    const selectedItems = filteredItems.filter(item => selectionModel.includes(item._id));
    
    if (selectedItems.length === 0) {
      showWarning('Vui lòng chọn ít nhất một sản phẩm để xóa');
      return;
    }

    // Tạo danh sách tên sản phẩm để hiển thị trong confirm dialog
    const productNames = selectedItems.length > 3 
      ? `${selectedItems.slice(0, 3).map(item => item.name).join(', ')} và ${selectedItems.length - 3} sản phẩm khác`
      : selectedItems.map(item => item.name).join(', ');

    const confirmed = await showConfirm({
      title: 'Xác nhận xóa sản phẩm',
      message: `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm sau?\n\n${productNames}\n\n⚠️ Hành động này không thể hoàn tác!`,
      type: 'danger',
      confirmText: `Xóa ${selectedItems.length} sản phẩm`,
      cancelText: 'Hủy'
    });

    if (!confirmed) return;

    try {
      setConfirmLoading(true);
      
      const result = await dispatch(deleteMultipleProducts(
        selectionModel,
        user?.username || 'admin'
      ));
      
      // Clear selection sau khi xóa
      setSelectionModel([]);
      
      showSuccess(
        `Đã xóa thành công ${result.deletedCount} sản phẩm!`,
        'Xóa sản phẩm thành công',
        5000
      );
      
    } catch (error) {
      showError(
        `Lỗi khi xóa sản phẩm: ${error.message}`,
        'Xóa thất bại',
        8000
      );
    } finally {
      setConfirmLoading(false);
    }
  }, [selectionModel, filteredItems, dispatch, user, showConfirm, showSuccess, showError, showWarning, setConfirmLoading]);

  const handlePrintLabels = useCallback(() => {
    const selectedItems = filteredItems.filter(item => selectionModel.includes(item._id));
    if (selectedItems.length === 0) {
      showWarning('Vui lòng chọn sản phẩm để in tem mã');
      return;
    }
    
    showInfo(`Đang chuẩn bị in tem mã cho ${selectedItems.length} sản phẩm...`);
    // TODO: Implement print labels functionality
  }, [selectionModel, filteredItems, showWarning, showInfo]);

  const handleImport = useCallback(() => {
    showInfo('Tính năng import file đang được phát triển');
    // TODO: Implement import functionality
  }, [showInfo]);

  const handleExport = useCallback(() => {
    showInfo('Tính năng xuất file đang được phát triển');
    // TODO: Implement export functionality
  }, [showInfo]);

  // Memoized columns configuration
  const columns = useMemo(() => [
    {
      field: 'image',
      headerName: 'Ảnh',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <ImageCell src={params.row.image} alt={params.row.name} />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'code',
      headerName: 'Mã hàng',
      width: 130,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'name',
      headerName: 'Tên hàng',
      flex: 1,
      minWidth: 180,
      headerAlign: 'center',
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <CategoryChip value={params.value} />,
    },
    {
      field: 'supplier',
      headerName: 'Nhà cung cấp',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <SupplierChip value={params.value} />,
    },
    {
      field: 'price',
      headerName: 'Giá bán',
      width: 120,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <PriceCell value={params.value} color="success.main" />,
    },
    {
      field: 'cost',
      headerName: 'Giá vốn',
      width: 120,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <PriceCell value={params.value} />,
    },
    {
      field: 'stock',
      headerName: 'Tồn kho',
      width: 100,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box 
          onClick={(e) => handleStockClick(params.row, e)}
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
        >
          <StockChip stock={params.value} />
        </Box>
      ),
    },
    {
      field: 'lastUpdated',
      headerName: 'Cập nhật cuối',
      width: 170,
      headerAlign: 'center',
      align: 'center',
      valueGetter: (value, row) => {
        // Sử dụng cú pháp mới của MUI DataGrid v6+
        return getLastUpdatedDate(row._id);
      },
      renderCell: (params) => {
        const lastUpdatedDate = getLastUpdatedDate(params.row._id);
        return (
          <DateCell 
            value={lastUpdatedDate} 
            productId={params.row._id}
            historyMap={productHistoryMap}
          />
        );
      },
      sortComparator: (v1, v2) => {
        const date1 = new Date(v1);
        const date2 = new Date(v2);
        return date1.getTime() - date2.getTime();
      }
    },
  ], [handleStockClick, getLastUpdatedDate, productHistoryMap]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Đang tải dữ liệu tồn kho...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => dispatch(fetchInventoryItems())}
          startIcon={<InventoryIcon />}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <InventoryIcon sx={{ mr: 1, fontSize: 32 }} color="primary" />
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Quản lý hàng tồn kho
          </Typography>
        </Box>
        
        {/* Dynamic Action Buttons */}
        {selectionModel.length > 0 ? (
          <SelectionActions
            selectedCount={selectionModel.length}
            onExport={handleExportSelected}
            onPrintLabels={handlePrintLabels}
            onImport={handleImportSelected}
            onDelete={handleDeleteSelected}
          />
        ) : (
          <DefaultActions
            onAddNew={handleAddNew}
            onImport={handleImport}
            onExport={handleExport}
          />
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng sản phẩm"
            value={items.length}
            icon={<InventoryIcon color="primary" sx={{ fontSize: 48 }} />}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng tồn kho"
            value={statistics.totalStock.toLocaleString()}
            icon={<TrendingUpIcon color="success" sx={{ fontSize: 48 }} />}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Giá trị tồn kho"
            value={`${statistics.totalValue.toLocaleString('vi-VN')}đ`}
            icon={<TrendingUpIcon color="info" sx={{ fontSize: 48 }} />}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Hết hàng"
            value={statistics.outOfStockItems}
            icon={<WarningIcon color="error" sx={{ fontSize: 48 }} />}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Tìm theo mã hàng, tên sản phẩm, nhà cung cấp..."
              value={filters.search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái tồn kho</InputLabel>
              <Select
                value={filters.stockStatus}
                onChange={(e) => handleStockFilter(e.target.value)}
                label="Trạng thái tồn kho"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="in-stock">Còn hàng</MenuItem>
                <MenuItem value="out-of-stock">Hết hàng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Hiển thị: <strong>{filteredItems.length}</strong> / <strong>{items.length}</strong> sản phẩm
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <HistoryIcon fontSize="small" sx={{ mr: 0.5 }} />
                Nhấp vào số tồn kho để xem lịch sử
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <Paper sx={{ p: 0, borderRadius: 2 }}>
        <DataGrid
          rows={filteredItems}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
          rowSelectionModel={selectionModel}
          onRowClick={handleRowClick}
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            minHeight: 400,
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Product Popup */}
      <AddProductPopup
        isOpen={openPopup}
        onClose={handleClosePopup}
        onSuccess={handleAddSuccess}
        editItem={editingItem}
      />

      {/* Product History Dialog */}
      <ProductHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        product={selectedProduct}
      />

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        autoHideDuration={notification.autoHideDuration}
        onClose={hideNotification}
        title={notification.title}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        onClose={hideConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        loading={confirmState.loading}
      />
    </Box>
  );
}

export default React.memo(Inventory);