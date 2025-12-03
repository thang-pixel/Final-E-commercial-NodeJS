// src/components/admin/NotificationDropdown.jsx

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import {
  ShoppingCartOutlined,
  AlertOutlined,
  MessageOutlined,
  UserOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  CarOutlined,
  EyeOutlined,
  BellOutlined,
  EyeFilled,
} from '@ant-design/icons';
import { ADMIN_NOTIFICATIONS } from '../../../constants/adminConstants';
import { formatTimeAgo } from '../../../utils/calculatorTimeUtils';
import { AllInbox, ProductionQuantityLimits, RateReview, ShoppingCart } from '@mui/icons-material';
import { markReadNotify } from '../../../api/notificationApi'; 

// === MOCK DATA: thay bằng data từ API sau cũng được ===
// const notifications = [
//   {
//     _id: 1,
//     user_id: 1,
//     type: 'ORDER',
//     title: 'Đơn hàng mới #INV-2025-0001',
//     link: '/admin/orders/101',
//     message:
//       'Khách hàng Nguyễn Văn A vừa tạo đơn hàng 3 sản phẩm, tổng 12.500.000₫.',
//     is_read: false,
//   },
//   {
//     _id: 2,
//     user_id: 1,
//     type: 'ORDER',
//     title: 'Đơn hàng mới #INV-2025-0002',
//     link: '/admin/orders/102',
//     message: 'Khách hàng Trần Thị B vừa đặt 1 Laptop Dell XPS 13, COD.',
//     is_read: false,
//   },
//   {
//     _id: 3,
//     user_id: 1,
//     type: 'PRODUCT',
//     title: 'Sắp hết hàng: iPhone 16 Pro 256GB',
//     link: '/admin/products/iphone-16-pro-256',
//     message:
//       'Biến thể iPhone 16 Pro 256GB (màu Titan Black) chỉ còn 3 sản phẩm trong kho.',
//     is_read: false,
//   },
//   {
//     _id: 4,
//     user_id: 1,
//     type: 'PRODUCT',
//     title: 'Hết hàng: Samsung Galaxy S25 Ultra 512GB',
//     link: '/admin/products/galaxy-s25-ultra-512',
//     message:
//       'Biến thể Samsung Galaxy S25 Ultra 512GB đã hết hàng, vui lòng kiểm tra nhập thêm.',
//     is_read: true,
//   },
//   {
//     _id: 5,
//     user_id: 1,
//     type: 'COMMENT',
//     title: 'Đánh giá 5★ cho MacBook Air M3',
//     link: '/admin/products/macbook-air-m3?tab=reviews',
//     message: 'User: longnguyen – “Máy mát, pin trâu, dùng code rất ổn.”',
//     is_read: false,
//   },
//   {
//     _id: 6,
//     user_id: 1,
//     type: 'COMMENT',
//     title: 'Đánh giá 2★ cho iPhone 15',
//     link: '/admin/products/iphone-15?tab=reviews',
//     message: 'User: huyhoang – “Pin tụt khá nhanh, mong shop tư vấn thêm.”',
//     is_read: false,
//   },
//   {
//     _id: 7,
//     user_id: 1,
//     type: 'PROMOTION',
//     title: 'Coupon TET2026 sắp hết lượt dùng',
//     link: '/admin/promotions/TET2026',
//     message:
//       'Mã TET2026 đã được sử dụng 9/10 lượt, vui lòng kiểm tra chiến dịch.',
//     is_read: true,
//   },
//   {
//     _id: 8,
//     user_id: 1,
//     type: 'USER',
//     title: 'Khách hàng mới đăng ký',
//     link: '/admin/customers/2001',
//     message: 'Tài khoản mới: leminhquan@example.com vừa đăng ký hệ thống.',
//     is_read: false,
//   },
//   {
//     _id: 9,
//     user_id: 1,
//     type: 'SHIPPING',
//     title: 'Đơn #INV-2025-0001 đã bàn giao cho đơn vị vận chuyển',
//     link: '/admin/orders/101',
//     message:
//       'Đơn hàng #INV-2025-0001 đã được bàn giao cho GHN, mã vận đơn GHN123456.',
//     is_read: true,
//   },
//   {
//     _id: 10,
//     user_id: 1,
//     type: 'INFO',
//     title: 'Báo cáo doanh thu hôm nay đã sẵn sàng',
//     link: '/admin/reports',
//     message:
//       'Báo cáo doanh thu và đơn hàng ngày 02/12/2025 đã được tổng hợp.',
//     is_read: false,
//   },
// ];

// === helper: chọn icon theo type ===
const getNotifIcon = (type) => {
  switch (type) {
    case ADMIN_NOTIFICATIONS.ORDER_NEW ||
      ADMIN_NOTIFICATIONS.ORDER_STATUS_CHANGED:
      return <ShoppingCartOutlined />;
    case ADMIN_NOTIFICATIONS.STOCK_LOW || ADMIN_NOTIFICATIONS.STOCK_OUT:
      return <AlertOutlined />;
    case ADMIN_NOTIFICATIONS.PRODUCT_REVIEWED:
      return <MessageOutlined />;
    case ADMIN_NOTIFICATIONS.USER_REGISTERED:
      return <UserOutlined />;
    case 'PROMOTION':
      return <GiftOutlined />;
    case 'SHIPPING':
      return <CarOutlined />;
    case 'INFO':
    default:
      return <InfoCircleOutlined />;
  }
};

/**const ADMIN_NOTIFICATIONS = {
  ORDER_NEW: 'ORDER_NEW',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  USER_REGISTERED: 'USER_REGISTERED',
  STOCK_LOW: 'STOCK_LOW',
  STOCK_OUT: 'STOCK_OUT',
  PRODUCT_REVIEWED: 'PRODUCT_REVIEWED',
};
 */

const NotificationDropdown = ({ notifications = [], setNotifications, isOpen }) => {
  const [type, setType] = useState('ALL');

  const handleChangeType = (event, newValue) => {
    setType(newValue);
  };

  const toggleDropdownClass = () => {
    let tmp = isOpen
      ? 'opacity-100 visible pointer-events-auto'
      : 'opacity-0 invisible pointer-events-none';
    if (isOpen) {
      return (
        tmp +
        ' border border-gray-200 h-96 min-w-full transition-all duration-300 ease-in-out'
      );
    }
    return ' h-0 min-w-0 overflow-hidden transition-all duration-300 ease-in-out';
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (type === 'ALL') return true;
      if (type === 'ORDER')
        return (
          notif.type === ADMIN_NOTIFICATIONS.ORDER_NEW ||
          notif.type === ADMIN_NOTIFICATIONS.ORDER_STATUS_CHANGED
        );
      if (type === 'PRODUCT')
        return (
          notif.type === ADMIN_NOTIFICATIONS.STOCK_LOW ||
          notif.type === ADMIN_NOTIFICATIONS.STOCK_OUT
        );
      if (type === 'REVIEW')
        return notif.type === ADMIN_NOTIFICATIONS.PRODUCT_REVIEWED;

      if (type === 'USER' && notif.type === ADMIN_NOTIFICATIONS.USER_REGISTERED)
        return true;
      if (type === 'PROMOTION' && notif.type === 'PROMOTION') return true;
      if (type === 'SHIPPING' && notif.type === 'SHIPPING') return true;
      if (type === 'INFO' && notif.type === 'INFO') return true;
      // sau này mở rộng thêm CUSTOMER / REVIEW thì map tiếp
      return false;
    });
  }, [type, notifications]);

  const handleMarkRead = async (notifId) => {
    try {
      const resp = await markReadNotify(notifId);
      console.log('Marked notification as read:', resp);
      const updatedNotification = resp.data;
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === notifId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  return (
    <div
      className={
        ' bg-white rounded-md shadow-lg  ' +
        ' min-w-full' +
        toggleDropdownClass()
      }
    >
      <div className="flex flex-col w-full h-full p-2">
        {/* header */}
        <div className="p-2 border-b border-gray-200 font-bold text-base flex justify-between items-center">
          <Typography variant="subtitle1">
            <BellOutlined /> Thông báo
          </Typography>
          <Link
            to="/admin/notifications"
            className="text-xs text-blue-600 hover:underline"
          >
            <EyeOutlined /> Xem tất cả
          </Link>
        </div>

        {/* tabs */}
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={type}
            onChange={(e, newValue) => handleChangeType(e, newValue)}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="notification type tabs"
            variant="fullWidth" 
          >
            <Tab value="ALL" label={<AllInbox />} />
            <Tab value="REVIEW" label={<RateReview />} />
            <Tab value="ORDER" label={<ShoppingCart />} />
            {/* <Tab value="PRODUCT" label={<ProductionQuantityLimits />} />  */}
            {/* {/* <Tab value="CUSTOMER" label="Khách hàng" /> */}
          </Tabs>
        </Box>

        {/* notification items */}
        <div className="overflow-y-auto max-h-64">
          {filteredNotifications.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">
              Không có thông báo nào.
            </div>
          )}

          {filteredNotifications.map((notif) => (
            <Link
              to={notif.link}
              key={notif._id}
              onClick={(e) => handleMarkRead(notif._id)}
              className={
                'flex items-center gap-3 w-full p-1 border-b border-gray-100 ' +
                'hover:bg-gray-50 transition-colors ' +
                (notif.is_read ? 'bg-white' : 'bg-blue-50')
              }
            >
              {/* icon */}
              <div className="mt-1">
                <span className="p-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                  {getNotifIcon(notif.type)}
                </span>
              </div>

              {/* content */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium line-clamp-1">
                  {notif.title}
                </span>
                <span className="text-xs text-gray-700 line-clamp-2">
                  {notif.message}
                </span>
              </div>

              {/* time (mock) */}
              <div className="ml-2 text-[10px] text-gray-400 whitespace-nowrap">
                {formatTimeAgo(notif.createdAt)}
              </div>
            </Link>
          ))}
        </div>

        {/* footer */}
        <span className=""></span>
        <Link
          to="/admin/notifications"
          className="p-1 mt-auto border-t border-gray-200 text-center text-xs text-blue-600 hover:underline"
        >
          <EyeFilled /> Xem tất cả thông báo
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
