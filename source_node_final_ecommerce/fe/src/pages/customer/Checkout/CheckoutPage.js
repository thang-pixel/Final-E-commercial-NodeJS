import React, { useState, useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  MenuItem
} from '@mui/material'; 
import { ShoppingCart, Payment, LocalShipping } from '@mui/icons-material';
import { createOrder } from '../../../redux/reducers/orderSlice';
import { getMyProfile } from '../../../redux/reducers/userSlice'; // Import từ userSlice

function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Đọc từ localStorage thay vì Redux state
  const [checkoutItems, setCheckoutItems] = useState([]);
  const { user } = useSelector(state => state.auth);
  const { profile, addresses, loading: userLoading } = useSelector(state => state.user); // Đọc từ userSlice
  const { loading, error } = useSelector(state => state.orders);
  
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

  // Load thông tin user profile khi component mount
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

  // Tự động điền thông tin khi profile được load
  useEffect(() => {
    if (profile) {
      console.log('Profile loaded:', profile);
      console.log('Addresses:', addresses);
      
      setShippingInfo(prev => ({
        ...prev,
        full_name: profile.name || profile.full_name || '',
        phone: profile.phone || '',
        // Nếu có địa chỉ mặc định, sử dụng địa chỉ đó
        //...(addresses && addresses.length > 0 && {
        //  address: addresses[0].address || '',
        //  ward: addresses[0].ward || '',
        //  district: addresses[0].district || '',
        //  province: addresses[0].province || ''
        // })
      }));
    }
  }, [profile, addresses]);
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [customerNote, setCustomerNote] = useState('');
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  // Tính toán giá từ checkoutItems thay vì carts
  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discountAmount = loyaltyPointsToUse;
  const totalAmount = subtotal + shippingFee - discountAmount;
  
  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý khi chọn địa chỉ có sẵn
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
      // Reset to empty if "new address" is selected
      setShippingInfo(prev => ({
        ...prev,
        address: '',
        ward: '',
        district: '',
        province: ''
      }));
    }
  };

  // Xử lý khi chọn "Sử dụng thông tin tài khoản"
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
      loyalty_points_used: loyaltyPointsToUse
    };
    
    console.log('Order data:', orderData);
    
    try {
      const result = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(result)) {
        // Xóa checkout items khỏi localStorage
        localStorage.removeItem('checkout_items');
        
        // Chuyển đến trang thành công
        navigate('/order-success', { 
          state: { 
            order: result.payload.data.order,
            loyaltyPointsEarned: result.payload.data.loyalty_points_earned
          }
        });
      }
    } catch (error) {
      console.error('Order error:', error);
    }
  };
  
  // Loading state
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

            {/* Nút sử dụng thông tin tài khoản */}
            {profile && (
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleUseAccountInfo}
                  sx={{ mr: 2 }}
                >
                  Sử dụng thông tin tài khoản
                </Button>
                
                {/* Dropdown chọn địa chỉ có sẵn */}
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
            
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
              <FormControlLabel value="BANK_TRANSFER" control={<Radio />} label="Chuyển khoản ngân hàng" />
              <FormControlLabel value="CREDIT_CARD" control={<Radio />} label="Thẻ tín dụng" />
              <FormControlLabel value="E_WALLET" control={<Radio />} label="Ví điện tử" />
            </RadioGroup>
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
              
              {/* Danh sách sản phẩm từ checkoutItems */}
              {checkoutItems.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      component="img"
                      src={item.image_url}
                      alt={item.name}
                      sx={{ width: 50, height: 50, objectFit: 'cover', mr: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">{item.name}</Typography>
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
              
              {/* Điểm tích lũy */}
              {profile?.loyalty_points > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Điểm tích lũy có thể dùng: {profile.loyalty_points.toLocaleString()}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sử dụng điểm"
                    value={loyaltyPointsToUse}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(profile.loyalty_points, subtotal, parseInt(e.target.value) || 0));
                      setLoyaltyPointsToUse(value);
                    }}
                    inputProps={{ max: Math.min(profile.loyalty_points, subtotal) }}
                  />
                </Box>
              )}
              
              {/* Tính toán giá */}
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
              
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá (điểm):</Typography>
                  <Typography color="success.main">-{discountAmount.toLocaleString()}đ</Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="error">
                  {totalAmount.toLocaleString()}đ
                </Typography>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Đặt hàng'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CheckoutPage;