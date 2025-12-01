import { Routes, Route, Outlet } from 'react-router-dom';

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

function CustomerRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} /> 
      
      <Route path="/" element={<CustomerLayout user={user} />}>
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
        <Route path="checkout" element={user ? <CheckoutPage /> : <Login />} />
        
        <Route path="order-success" element={<OrderSuccess />} />
        
        {/* Payment routes */}
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="payment/failed" element={<PaymentFailed />} />
        
        {/* Account nested routes */}
        <Route path="account" element={user ? <AccountCustomer /> : <Login />}>
          <Route path="profile" element={user ? <Profile /> : <Login />} />
          <Route path="orders" element={user ? <Order /> : <Login />} />
          <Route path="orders/:orderId" element={user ? <OrderDetail /> : <Login />} />
          <Route path="carts" element={user ? <Cart /> : <Login />} />
          <Route path="favorites" element={user ? <Favorite /> : <Login />} />
        </Route>

        {/* Pages */}
        <Route path="home" element={<Home />} />
        <Route path="contact" element={<>Contact</>} />
        <Route path="about" element={<>About</>} />
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