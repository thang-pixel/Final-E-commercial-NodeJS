import {
  Close,
  DeleteForeverOutlined,
  RemoveRedEyeOutlined,
  ShoppingCartOutlined,
} from '@mui/icons-material';
import useCart from '../../hooks/cartHook';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { removeFromCart, removeItemCartUser, updateCartItemUser, updateQuantity } from '../../redux/reducers/cartSlice';
import { message } from 'antd';
import { getVariantByIdApi } from '../../api/productVariantApi';
import { useMemo, useState } from 'react';
import currencyUtils from '../../utils/currencyUtils';
import { Checkbox } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/authHook';

const CartDrawer = ({ ref, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [messageAntd, contextHolder] = message.useMessage();
  const { carts, length, totalPrice: totalPriceStored } = useCart();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useAuth(); // replace with actual auth state

  // checked item
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedVariants, setSelectedVariants] = useState({});
  const handleChangeSelected = (e, variant) => {
    const { checked } = e.target;
    // update selected items
    // ...
    // console.log('Change selected item: ', e.target.name, ' | checked: ', checked);
    setSelectedItems((prev) => ({ ...prev, [e.target.name]: checked }) );
    setSelectedVariants((prev) => {
      const newSelected = { ...prev };
      if (checked) {
        newSelected[e.target.name] = variant;
      } else {
        delete newSelected[e.target.name];
      }
      return newSelected;
    });
 
  };


  // calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(selectedVariants).reduce((total, item) => total + item.price * item.quantity, 0);
  }, [selectedVariants]);

  const handleUpdateQuantity = async (product_id, variant_id, quantity) => {
    if (quantity < 0) return;
    // dispatch update quantity action
    // check in stock before updating

    try {
      const resp = await getVariantByIdApi(variant_id, product_id);
      console.log('Variant check stock resp: ', resp);
      if (quantity > resp.data.stock) {
        messageAntd.error(
          'Số lượng trong kho không đủ, vui lòng giảm số lượng!'
        );
        return;
      }
    } catch (error) {
      console.error('Error checking stock: ', error);
      messageAntd.error(error.response?.data?.message || 'Lỗi khi kiểm tra số lượng trong kho');
      return;
    }

    // ...
    if (isLoggedIn) {
      // update on server
      const res = await  dispatch(updateCartItemUser({ user_id: user._id, product_id, variant_id, quantity })); 
      console.log('Update cart item server response: ', res);
      if (res.error) {
        messageAntd.error(res.payload.message || 'Lỗi khi cập nhật số lượng trên server');
        return;
      }
      messageAntd.success('Cập nhật cart số lượng thành công');
    } else {
      // update in local storage
      dispatch(updateQuantity({ product_id, variant_id, quantity }));
      messageAntd.success('Cập nhật cart số lượng thành công');
    }

    // cập nhật selected variants nếu có
    setSelectedVariants((prev) => {
      if (prev[variant_id]) {
        return {
          ...prev,
          [variant_id]: {
            ...prev[variant_id],
            quantity,
          },
        };
      }
      return prev;
    });
  };
  const handleDeleteItem = async (product_id, variant_id) => {
    // dispatch remove from cart action
    // ...
    if (isLoggedIn) {
      // remove on server
      const res = await dispatch(removeItemCartUser({ user_id: user._id, product_id, variant_id }));
      if (res.error) {
        messageAntd.error(res.error.message || 'Lỗi khi xoá sản phẩm khỏi giỏ hàng trên server');
        return;
      }
      messageAntd.success('Xoá sản phẩm khỏi giỏ hàng thành công');
    } else {
      // remove in local storage
      dispatch(removeFromCart({ product_id, variant_id }));
      messageAntd.success('Xoá sản phẩm khỏi giỏ hàng thành công');
    }
  };

  const handleCheckout = async () => {
    if (Object.keys(selectedVariants).length === 0) {
      messageAntd.warning('Vui lòng chọn sản phẩm để thanh toán!');
      return;
    }
    // Save selectedVariants to localStorage for checkout page
    localStorage.setItem('checkout_items', JSON.stringify(Object.values(selectedVariants)));
    // Navigate to checkout page

    // update cart state
    await Promise.all(Object.keys(selectedVariants).map(async (variant_id) => {
      const variant = selectedVariants[variant_id];
      console.log('Removing variant from cart before checkout: ', variant);
      dispatch(removeFromCart({ product_id: variant.product_id, variant_id : variant.variant_id }));
    }));

    window.location.href = '/checkout';
  }
  

  return (
    <div
      ref={ref}
      className={
        (isOpen ? 'translate-x-0' : 'translate-x-full') +
        ` menu-drawer  
        h-screen w-full sm:w-96 md:w-[28rem]
        bg-white 
        fixed top-0 right-0 z-30 shadow-lg 
        transform transition-transform duration-300 ease-in-out`
      }
    >
      {contextHolder}
      
      {/* Header */}
      <div className="flex justify-between items-center p-3 sm:p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-lg sm:text-xl" />
          <span className="font-semibold text-sm sm:text-lg">
            Giỏ hàng ({length})
          </span>
        </div>
        <Link 
          to="/carts" 
          className="mr-auto ml-2 text-xs sm:text-sm text-blue-600 hover:underline"
          onClick={() => setIsOpen(false)}
        >
          <RemoveRedEyeOutlined /> Xem chi tiết
        </Link>
        <Close 
          className="cursor-pointer text-xl" 
          onClick={() => setIsOpen(false)} 
        />
      </div>

      {/* Items list */}
      <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
        {/* Total in cart */}
        <div className="px-3 py-2 bg-gray-50 border-b">
          <span className="text-xs sm:text-sm text-gray-600">
            Tổng giỏ hàng:{' '}
            <span className="font-bold text-orange-600">
              {currencyUtils.formatCurrency(totalPriceStored)}
            </span>
          </span>
        </div>

        {/* Scrollable items */}
        <div className="flex-grow overflow-y-auto px-2 sm:px-4 py-2 space-y-3">
          {carts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCartOutlined style={{ fontSize: 48 }} />
              <p className="mt-2 text-sm">Giỏ hàng trống</p>
            </div>
          ) : (
            carts.map((item, index) => (
              <div
                key={index}
                className="flex gap-2 sm:gap-3 border-b pb-3 last:border-b-0"
              >
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    name={item.variant_id + ''}
                    checked={selectedVariants[item.variant_id] || false}
                    onChange={(e) => handleChangeSelected(e, item)}
                    size="small"
                  />
                </div>

                {/* Image */}
                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white border rounded-lg p-1 sm:p-2">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Name */}
                  <div className="font-semibold text-xs sm:text-sm line-clamp-2 mb-1">
                    {item.name}
                  </div>

                  {/* Price & Attributes */}
                  <div className="space-y-1">
                    <div className="text-red-600 font-bold text-sm sm:text-base">
                      {currencyUtils.formatCurrency(item.price)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                      {item.attributes
                        .map((attr) => `${attr.code}: ${attr.value}`)
                        .join(', ')}
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity - 1
                          )
                        }
                        sx={{ 
                          minWidth: '28px',
                          padding: '2px 8px',
                          fontSize: '12px'
                        }}
                      >
                        -
                      </Button>
                      <span className="text-xs sm:text-sm font-medium min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product_id,
                            item.variant_id,
                            item.quantity + 1
                          )
                        }
                        sx={{ 
                          minWidth: '28px',
                          padding: '2px 8px',
                          fontSize: '12px'
                        }}
                      >
                        +
                      </Button>
                    </div>

                    {/* Delete */}
                    <DeleteForeverOutlined
                      className="cursor-pointer text-red-600 text-xl"
                      onClick={() =>
                        handleDeleteItem(item.product_id, item.variant_id)
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checkout footer */}
      <div className="absolute bottom-0 w-full bg-white border-t p-3 sm:p-4 shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-sm sm:text-base">
            Tổng thanh toán:
          </span>
          <span className="font-bold text-red-600 text-base sm:text-lg">
            {currencyUtils.formatCurrency(totalPrice)}
          </span>
        </div>
        <Button
          onClick={handleCheckout}
          variant="contained"
          fullWidth
          size="medium"
          disabled={Object.keys(selectedVariants).length === 0}
        >
          Thanh toán ({Object.keys(selectedVariants).length})
        </Button>
      </div>
    </div>
  );
}; 

export default CartDrawer;
