import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

import Home from '../pages/customer/home';
import Cart from '../pages/customer/Cart';
import Profile from '../pages/customer/Profile';
import Order from '../pages/customer/Order';
import CustomerLayout from '../layouts/CustomerLayout/CustomerLayout';
import ErrorPage from '../pages/ErrorPage';
import useAuth from '../hooks/authHook';
import Login from '../pages/auth/Login';
import Logout from '../pages/auth/Logout';
import Category from '../pages/customer/Category';
import Register from '../pages/auth/Register';
import ProductDetail from '../pages/customer/Product/ProductDetail';
import ProductList from '../pages/customer/Product';
import AccountCustomer from '../pages/customer/Account/AccountCustomer';
import Favorite from '../pages/customer/Favorite/Favorite';
import CheckoutPage from '../pages/customer/Checkout/CheckoutPage';
import OrderSuccess from '../pages/customer/Order/OrderSuccess';
import OrderDetail from '../pages/customer/Order/OrderDetail';
import PaymentSuccess from '../pages/customer/Payment/PaymentSuccess';
import PaymentFailed from '../pages/customer/Payment/PaymentFailed';
import ContactPage from '../pages/customer/Contact/ContactPage';
import AboutPage from '../pages/customer/About/AboutPage';

// Component kiểm tra status của user
const StatusGuard = ({ children, user }) => {
  if (user && user.status === 'inactive') {
    // Clear localStorage và chuyển về login với thông báo
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
          from: window.location.pathname 
        }} 
      />
    );
  }
  return children;
};

function CustomerRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} /> 
      
      <Route path="/" element={
        <StatusGuard user={user}>
          <CustomerLayout user={user} />
        </StatusGuard>
      }>
        <Route index element={<Home />} />
        
        <Route path="products" element={<Outlet />}>
          <Route index element={<ProductList />} />
          <Route path=":slug" element={<ProductDetail />} />
          <Route path="" element={<ProductList />} /> {/* /products */}
        </Route>
        <Route path="categories" element={<Category />} />

        {/* cart cho cả guest */}
        <Route path="carts" element={<Cart />} />
        
        {/* Chỉnh lại luồng */}
        <Route path="checkout" element={
          user ? (
            user.status === 'inactive' ? 
            <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
            <CheckoutPage />
          ) : <Login />
        } />
        
        <Route path="order-success" element={<OrderSuccess />} />
        
        {/* Payment routes */}
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/failed" element={<PaymentFailed />} />
        
        {/* Account nested routes */}
        <Route path="account" element={
          user ? (
            user.status === 'inactive' ?
            <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
            <AccountCustomer />
          ) : <Login />
        }>
          <Route path="profile" element={
            user ? (
              user.status === 'inactive' ?
              <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
              <Profile />
            ) : <Login />
          } />
          <Route path="orders" element={
            user ? (
              user.status === 'inactive' ?
              <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
              <Order />
            ) : <Login />
          } />
          <Route path="orders/:orderId" element={
            user ? (
              user.status === 'inactive' ?
              <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
              <OrderDetail />
            ) : <Login />
          } />
          <Route path="carts" element={
            user ? (
              user.status === 'inactive' ?
              <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
              <Cart />
            ) : <Login />
          } />
          <Route path="favorites" element={
            user ? (
              user.status === 'inactive' ?
              <Navigate to="/login" replace state={{ message: 'Tài khoản của bạn đã bị khóa.' }} /> :
              <Favorite />
            ) : <Login />
          } />
        </Route>

        {/* Pages */}
        <Route path="home" element={<Home />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="" element={<Home />} />
      </Route>
      
      <Route
        path="/admin/*"
        element={<ErrorPage status={401} message="Unauthorized Access" />}
      />
      <Route
        path="/forbidden"
        element={<ErrorPage status={403} message="Forbidden" />}
      />
      <Route
        path="*"
        element={<ErrorPage status={404} message="Page Not Found" />}
      />
    </Routes>
  );
}

export default CustomerRoutes;