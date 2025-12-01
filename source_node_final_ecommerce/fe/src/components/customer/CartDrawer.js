import {
  Close,
  DeleteForeverOutlined,
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
    console.log('Change selected item: ', e.target.name, ' | checked: ', checked);
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
      messageAntd.error(error.message || 'Lỗi khi kiểm tra số lượng trong kho');
      return;
    }

    // ...
    if (isLoggedIn) {
      // update on server
      const res = await  dispatch(updateCartItemUser({ user_id: user._id, product_id, variant_id, quantity })); 
      if (res.error) {
        messageAntd.error(res.error.message || 'Lỗi khi cập nhật số lượng trên server');
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
        h-screen min-w-full sm:min-w-72 
        bg-white 
        fixed top-0 right-0 z-30 shadow-lg 
        transform transition-transform duration-300 ease-in-out`
      }
    >
      {contextHolder}
      <div className="flex justify-between items-center p-4 border-b h-20">
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined />
          <span className="font-semibold text-lg">
            Giỏ hàng ({length} sản phẩm)
          </span>
        </div>
        <div className='ml-auto mr-2 flex items-center gap-1 cursor-pointer text-blue-600 hover:underline'>
          <Link to="/carts">Xem giỏ hàng</Link>
        </div>
        <Close cursor="pointer" onClick={() => setIsOpen(false)} />
      </div>

      {/* items */}
      <div className="flex flex-col h-[calc(100vh-200px)] relative">
        <span className=" pl-4 text-sm text-gray-500">
          Tổng tiền giỏ hàng: <span className="font-bold text-orange-600">{currencyUtils.formatCurrency(totalPriceStored)}</span>
        </span>
        <div className="flex-grow overflow-y-auto p-4 space-y-4 h-full">
          {carts.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 border-b pb-4"
            >
              {/* checkbox */}
              <Checkbox  
                name={item.variant_id + ''}
                checked={selectedVariants[item.variant_id] || false}
                onChange={(e) => handleChangeSelected(e, item)}
              />

              {/* image */}
              <div className="w-20 h-20 flex-shrink-0 bg-white flex items-center justify-center p-2 border rounded-lg">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-contain rounded"
                />
              </div>

              {/* info */}
              <div className="flex-grow flex flex-col justify-between h-full">
                <div className="font-semibold text-sm line-clamp-2">
                  {item.name}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-red-600 font-bold">
                    {item.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded">
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
                    >
                      -
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
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
                    >
                      +
                    </Button>
                  </div>

                  <div className="ml-auto">
                    <DeleteForeverOutlined
                      className="cursor-pointer text-red-600"
                      onClick={() =>
                        handleDeleteItem(item.product_id, item.variant_id)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Checkout button */}

      <div className="p-2 mb-2 absolute bottom-0 w-full bg-white border-t">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Tổng thanh toán:</span>
          <span className="font-bold text-red-600">
            {totalPrice.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </span>
        </div>
        <Button onClick={handleCheckout} variant="contained" className="w-full ml-auto">
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartDrawer;
