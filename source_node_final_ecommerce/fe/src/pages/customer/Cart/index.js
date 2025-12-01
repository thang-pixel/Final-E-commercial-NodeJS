import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  DeleteForeverOutlined,
  Add,
  Remove,
  ShoppingCartCheckout,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  removeFromCart,
  removeItemCartUser,
  updateCartItemUser,
  updateQuantity,
} from '../../../redux/reducers/cartSlice';
import { getVariantByIdApi } from '../../../api/productVariantApi';
import currencyUtils from '../../../utils/currencyUtils';
import useAuth from '../../../hooks/authHook';

function Cart() {
  const [messageAntd, contextHolder] = message.useMessage();
  const { carts } = useSelector((state) => state.carts);
  const { user, isLoggedIn } = useAuth()
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  // State quản lý checkbox
  const [isCheckedAll, setIsCheckedAll] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  // ✅ Tự động check all khi tất cả item được chọn
  useEffect(() => {
    if (carts.length === 0) {
      setIsCheckedAll(false);
      return;
    }
    const allSelected = carts.every(item => selectedVariants[item.variant_id]);
    setIsCheckedAll(allSelected);
  }, [selectedVariants, carts]);

  // ✅ Xử lý check all
  const handleCheckAll = (e) => {
    const checked = e.target.checked;
    setIsCheckedAll(checked);
    
    const newSelected = {};
    if (checked) {
      carts.forEach(item => {
        newSelected[item.variant_id] = true;
      });
    }
    setSelectedVariants(newSelected);
  };

  // ✅ Xử lý check từng item
  const handleCheckItem = (variant_id) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variant_id]: !prev[variant_id],
    }));
  };

  // ✅ Tính toán các sản phẩm được chọn
  const selectedItems = useMemo(() => {
    return carts.filter(item => selectedVariants[item.variant_id]);
  }, [carts, selectedVariants]);

  // ✅ Tính tổng tiền các item được chọn
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }, [selectedItems]);

  // ✅ Cập nhật số lượng
  const handleUpdateQuantity = async (product_id, variant_id, quantity) => {
    if (quantity < 1) return;

    try {
      const resp = await getVariantByIdApi(variant_id, product_id);
      
      if (quantity > resp.data.stock) {
        messageAntd.error(
          `Chỉ còn ${resp.data.stock} sản phẩm trong kho!`
        );
        return;
      }

      if (isLoggedIn && user) {
        // TODO: update on server
        dispatch(updateCartItemUser({ user_id: user._id, product_id, variant_id, quantity }));
        messageAntd.success('Cập nhật số lượng thành công');
      } else {
        dispatch(updateQuantity({ product_id, variant_id, quantity }));
        messageAntd.success('Cập nhật số lượng thành công');
      }
    } catch (error) {
      console.error('Error checking stock: ', error);
      messageAntd.error('Lỗi khi kiểm tra số lượng trong kho');
    }
  };

  // ✅ Xóa sản phẩm
  const handleDeleteItem = (product_id, variant_id) => {
    if (isLoggedIn && user) {
      // TODO: remove on server
      dispatch(removeItemCartUser({ user_id: user._id, product_id, variant_id, }));
      messageAntd.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } else {
      dispatch(removeFromCart({ product_id, variant_id }));
      messageAntd.success('Đã xóa sản phẩm khỏi giỏ hàng');
    }
    
    // Xóa khỏi selected
    setSelectedVariants((prev) => {
      const newSelected = { ...prev };
      delete newSelected[variant_id];
      return newSelected;
    });
  };

  // ✅ Xóa các item đã chọn
  const handleDeleteSelected = () => {
    selectedItems.forEach(item => {
      handleDeleteItem(item.product_id, item.variant_id);
    });
    setSelectedVariants({});
  };

  // ✅ Thanh toán
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      messageAntd.warning('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }

    // xoa khoir cart
    
    // Lưu vào localStorage
    localStorage.setItem('checkout_items', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  return (
    <>
      {contextHolder}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Giỏ hàng của bạn
        </Typography>

        {carts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Giỏ hàng trống
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Tiếp tục mua sắm
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {/* Danh sách sản phẩm */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ overflow: 'hidden' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Checkbox
                    checked={isCheckedAll}
                    onChange={handleCheckAll}
                    indeterminate={
                      selectedItems.length > 0 && 
                      selectedItems.length < carts.length
                    }
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tất cả ({carts.length} sản phẩm)
                  </Typography>
                  
                  {selectedItems.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteForeverOutlined />}
                      onClick={handleDeleteSelected}
                    >
                      Xóa ({selectedItems.length})
                    </Button>
                  )}
                </Box>
                
                <Divider />
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox"></TableCell>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="center">Đơn giá</TableCell>
                        <TableCell align="center">Số lượng</TableCell>
                        <TableCell align="center">Thành tiền</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {carts.map((item) => (
                        <TableRow 
                          key={item.variant_id}
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: selectedVariants[item.variant_id] 
                              ? 'action.selected' 
                              : 'inherit'
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedVariants[item.variant_id] || false}
                              onChange={() => handleCheckItem(item.variant_id)}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'contain',
                                  borderRadius: 8,
                                  border: '1px solid #e0e0e0',
                                }}
                              />
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  fontWeight={600}
                                  sx={{ 
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  SKU: {item.SKU}
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {Object.values(item.attributes).map((attr, idx) => (
                                    <Chip
                                      key={idx}
                                      size="small"
                                      label={`${attr.code}: ${attr.value}`}
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Typography fontWeight={600} color="error">
                              {currencyUtils.formatCurrency(item.price)}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product_id,
                                    item.variant_id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Remove fontSize="small" />
                              </IconButton>
                              
                              <Typography 
                                sx={{ 
                                  minWidth: 40, 
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product_id,
                                    item.variant_id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          
                          <TableCell align="center">
                            <Typography fontWeight={700} color="primary">
                              {currencyUtils.formatCurrency(
                                item.price * item.quantity
                              )}
                            </Typography>
                          </TableCell>
                          
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDeleteItem(
                                  item.product_id,
                                  item.variant_id
                                )
                              }
                              
                            >
                              <DeleteForeverOutlined 
                                className='text-red-600'/>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Thông tin thanh toán */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Thông tin đơn hàng
                </Typography>
                
                <Divider sx={{ my: 2 }} />

                {selectedItems.length === 0 ? (
                  <Alert severity="info">
                    Chưa chọn sản phẩm nào
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Đã chọn {selectedItems.length} sản phẩm
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 1,
                    }}>
                      <Typography>Tạm tính:</Typography>
                      <Typography fontWeight={600}>
                        {currencyUtils.formatCurrency(totalAmount)}
                      </Typography>
                    </Box> 

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 3,
                    }}>
                      <Typography variant="h6" fontWeight={700}>
                        Tổng cộng:
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="error">
                        {currencyUtils.formatCurrency(totalAmount)}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCartCheckout />}
                      onClick={handleCheckout}
                    >
                      Thanh toán ({selectedItems.length})
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default Cart;