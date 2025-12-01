import React, { useState, useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel
} from '@mui/material'; 
import { 
  ShoppingCart, 
  Payment, 
  LocalShipping,
  CreditCard,
  AccountBalance,
  Wallet,
  LocalOffer
} from '@mui/icons-material';
import { createOrder } from '../../../redux/reducers/orderSlice';
import { getMyProfile } from '../../../redux/reducers/userSlice';
import { API_DOMAIN } from '../../../constants/apiDomain';

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [checkoutItems, setCheckoutItems] = useState([]);
  const { user } = useSelector(state => state.auth);
  const { profile, addresses, loading: userLoading } = useSelector(state => state.user);
  const { loading, error } = useSelector(state => state.orders);
  
  // Promotion state
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [promotionLoading, setPromotionLoading] = useState(false);
  
  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('checkout_items');
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems);
        console.log('Checkout items loaded:', items);
        setCheckoutItems(items);
      } catch (error) {
        console.error('Error parsing checkout items:', error);
        navigate('/cart');
      }
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  useEffect(() => {
    if (user && !profile) {
      console.log('Loading user profile...');
      dispatch(getMyProfile());
    }
  }, [user, profile, dispatch]);
  
  const [shippingInfo, setShippingInfo] = useState({
    full_name: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: ''
  });

  useEffect(() => {
    if (profile) {
      console.log('Profile loaded:', profile);
      console.log('Addresses:', addresses);
      
      setShippingInfo(prev => ({
        ...prev,
        full_name: profile.name || profile.full_name || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile, addresses]);
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [customerNote, setCustomerNote] = useState('');
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Tính toán giá với promotion
  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const loyaltyDiscount = loyaltyPointsToUse;
  const promotionDiscount = appliedPromotion?.discount_amount || 0;
  const totalDiscount = loyaltyDiscount + promotionDiscount;
  const totalAmount = subtotal + shippingFee - totalDiscount;
  
  // Validate promotion code
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }

    setPromotionLoading(true);
    
    try {
      const response = await axios.post(
        `${API_DOMAIN}/api/promotions/validate`,
        {
          code: promotionCode,
          order_amount: subtotal
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setAppliedPromotion(response.data.data);
        alert(`Áp dụng mã giảm giá thành công! Giảm ${response.data.data.discount_amount.toLocaleString()}đ`);
      }
    } catch (error) {
      console.error('Error validating promotion:', error);
      alert(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedPromotion(null);
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setPromotionCode('');
  };
  
  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    if (addressId && addresses) {
      const selectedAddress = addresses.find(addr => addr._id === addressId);
      if (selectedAddress) {
        setShippingInfo(prev => ({
          ...prev,
          address: selectedAddress.address || '',
          ward: selectedAddress.ward || '',
          district: selectedAddress.district || '',
          province: selectedAddress.province || ''
        }));
      }
    } else {
      setShippingInfo(prev => ({
        ...prev,
        address: '',
        ward: '',
        district: '',
        province: ''
      }));
    }
  };

  const handleUseAccountInfo = () => {
    if (profile) {
      setShippingInfo(prev => ({
        ...prev,
        full_name: profile.name || profile.full_name || '',
        phone: profile.phone || ''
      }));
    }
  };
  
  const handleSubmitOrder = async () => {
    // Validate
    if (!shippingInfo.full_name || !shippingInfo.phone || !shippingInfo.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    if (checkoutItems.length === 0) {
      alert('Không có sản phẩm để thanh toán');
      return;
    }
    
    const orderData = {
      items: checkoutItems.map(item => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
        image_url: item.image_url
      })),
      shipping_address: shippingInfo,
      payment_method: paymentMethod,
      customer_note: customerNote,
      loyalty_points_used: loyaltyPointsToUse,
      promotion_code: appliedPromotion?.code || null // THÊM MỚI
    };
    
    try {
      const result = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(result)) {
        localStorage.removeItem('checkout_items');
        
        // Kiểm tra phương thức thanh toán
        if (paymentMethod === 'VNPAY' && result.payload.data.payment?.payment_url) {
          // Hiển thị loading trước khi chuyển đến VNPay
          alert('Đang chuyển đến VNPay để thanh toán...');
          window.location.href = result.payload.data.payment.payment_url;
        } else {
          // COD hoặc các phương thức khác - chuyển đến trang thành công
          navigate('/order-success', { 
            state: { 
              order: result.payload.data.order,
              loyaltyPointsEarned: result.payload.data.loyalty_points_earned
            }
          });
        }
      }
    } catch (error) {
      console.error('Order error:', error);
    }
  };
  
  // Render payment method options with icons
  const renderPaymentMethods = () => {
    const methods = [
      {
        value: 'COD',
        label: 'Thanh toán khi nhận hàng (COD)',
        icon: <Payment />,
        description: 'Thanh toán bằng tiền mặt khi nhận hàng'
      },
      {
        value: 'VNPAY',
        label: 'Thanh toán qua VNPay',
        icon: <CreditCard />,
        description: 'Thanh toán qua QR Code VNPay, ATM, Internet Banking'
      },
      {
        value: 'BANK_TRANSFER',
        label: 'Chuyển khoản ngân hàng',
        icon: <AccountBalance />,
        description: 'Chuyển khoản trực tiếp vào tài khoản ngân hàng'
      },
      {
        value: 'E_WALLET',
        label: 'Ví điện tử',
        icon: <Wallet />,
        description: 'Thanh toán qua các ví điện tử'
      }
    ];

    return (
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
          Chọn phương thức thanh toán
        </FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          {methods.map((method) => (
            <Box key={method.value} sx={{ mb: 1 }}>
              <FormControlLabel
                value={method.value}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {method.icon}
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {method.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ 
                  alignItems: 'flex-start',
                  p: 1,
                  border: '1px solid',
                  borderColor: paymentMethod === method.value ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  bgcolor: paymentMethod === method.value ? 'primary.50' : 'transparent',
                  '&:hover': {
                    bgcolor: 'grey.50'
                  }
                }}
              />
              
              {/* VNPay specific info */}
              {method.value === 'VNPAY' && paymentMethod === 'VNPAY' && (
                <Alert severity="info" sx={{ mt: 1, ml: 4 }}>
                  <Typography variant="body2">
                    • Hỗ trợ thanh toán qua QR Code<br/>
                    • Thẻ ATM các ngân hàng<br/>
                    • Internet Banking<br/>
                    • Ví điện tử VNPay
                  </Typography>
                </Alert>
              )}
            </Box>
          ))}
        </RadioGroup>
      </FormControl>
    );
  };
  
  if (userLoading && !profile) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải thông tin...
        </Typography>
      </Box>
    );
  }
  
  if (checkoutItems.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Không có sản phẩm để thanh toán</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Tiếp tục mua sắm
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <ShoppingCart sx={{ mr: 1 }} />
        Thanh toán
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Thông tin giao hàng */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1 }} />
              Thông tin giao hàng
            </Typography>

            {profile && (
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleUseAccountInfo}
                  sx={{ mr: 2 }}
                >
                  Sử dụng thông tin tài khoản
                </Button>
                
                {addresses && addresses.length > 0 && (
                  <FormControl variant="outlined" sx={{ minWidth: 300 }}>
                    <InputLabel>Chọn địa chỉ có sẵn</InputLabel>
                    <Select
                      value={selectedAddressId}
                      onChange={(e) => handleSelectAddress(e.target.value)}
                      label="Chọn địa chỉ có sẵn"
                      size="small"
                    >
                      <MenuItem value="">
                        <em>Nhập địa chỉ mới</em>
                      </MenuItem>
                      {addresses.map((address) => (
                        <MenuItem key={address._id} value={address._id}>
                          {`${address.address}, ${address.ward}, ${address.district}, ${address.province}`}
                          {address.is_default && ' (Mặc định)'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Họ tên"
                  value={shippingInfo.full_name}
                  onChange={(e) => handleShippingChange('full_name', e.target.value)}
                  required
                  helperText={profile ? "Từ thông tin tài khoản" : ""}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={shippingInfo.phone}
                  onChange={(e) => handleShippingChange('phone', e.target.value)}
                  required
                  helperText={profile ? "Từ thông tin tài khoản" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={shippingInfo.address}
                  onChange={(e) => handleShippingChange('address', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phường/Xã"
                  value={shippingInfo.ward}
                  onChange={(e) => handleShippingChange('ward', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Quận/Huyện"
                  value={shippingInfo.district}
                  onChange={(e) => handleShippingChange('district', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tỉnh/Thành phố"
                  value={shippingInfo.province}
                  onChange={(e) => handleShippingChange('province', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Phương thức thanh toán */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Payment sx={{ mr: 1 }} />
              Phương thức thanh toán
            </Typography>
            
            {renderPaymentMethods()}
          </Paper>
          
          {/* Ghi chú */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ghi chú đơn hàng
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ghi chú thêm cho đơn hàng..."
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </Paper>
        </Grid>
        
        {/* Tóm tắt đơn hàng */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tóm tắt đơn hàng
              </Typography>
              
              {/* Danh sách sản phẩm */}
              {checkoutItems.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      component="img"
                      src={item.image_url}
                      alt={item.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover', mr: 1, borderRadius: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.attributes?.map(attr => `${attr.code}: ${attr.value}`).join(', ')}
                      </Typography>
                      <Typography variant="body2">
                        {item.quantity} x {item.price.toLocaleString()}đ
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              
              <Divider sx={{ my: 2 }} />
              
              {/* Promotion Code Section - THÊM MỚI */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <LocalOffer sx={{ mr: 1, fontSize: 16 }} />
                  Mã giảm giá
                </Typography>
                
                {!appliedPromotion ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Nhập mã giảm giá"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromotion()}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleApplyPromotion}
                      disabled={promotionLoading}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      {promotionLoading ? <CircularProgress size={20} /> : 'Áp dụng'}
                    </Button>
                  </Box>
                ) : (
                  <Alert 
                    severity="success" 
                    action={
                      <Button color="inherit" size="small" onClick={handleRemovePromotion}>
                        Bỏ
                      </Button>
                    }
                  >
                    <Typography variant="body2">
                      <strong>{appliedPromotion.code}</strong><br/>
                      {appliedPromotion.name}<br/>
                      Giảm {appliedPromotion.discount_amount.toLocaleString()}đ
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              {/* Loyalty Points Section */}
              {profile?.loyalty_points > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Điểm tích lũy có thể dùng: {profile.loyalty_points.toLocaleString()}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sử dụng điểm"
                    value={loyaltyPointsToUse}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(profile.loyalty_points, subtotal - promotionDiscount, parseInt(e.target.value) || 0));
                      setLoyaltyPointsToUse(value);
                    }}
                    inputProps={{ max: Math.min(profile.loyalty_points, subtotal - promotionDiscount) }}
                  />
                </Box>
              )}
              
              {/* Price Breakdown */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{subtotal.toLocaleString()}đ</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>
                  {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString()}đ`}
                </Typography>
              </Box>
              
              {promotionDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá (mã):</Typography>
                  <Typography color="success.main">-{promotionDiscount.toLocaleString()}đ</Typography>
                </Box>
              )}
              
              {loyaltyDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá (điểm):</Typography>
                  <Typography color="success.main">-{loyaltyDiscount.toLocaleString()}đ</Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="error">
                  {totalAmount.toLocaleString()}đ
                </Typography>
              </Box>
              
              {/* VNPay Notice */}
              {paymentMethod === 'VNPAY' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Bạn sẽ được chuyển đến VNPay để hoàn tất thanh toán.
                  </Typography>
                </Alert>
              )}
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmitOrder}
                disabled={loading}
                startIcon={paymentMethod === 'VNPAY' ? <CreditCard /> : <Payment />}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Đặt hàng'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CheckoutPage;