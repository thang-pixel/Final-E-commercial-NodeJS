import { Routes, Route, Outlet } from 'react-router-dom';

import Home from '../pages/customer/home';
// import ProductDetail from "../pages/customer/ProductDetail";
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
function CustomerRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/" element={<CustomerLayout user={user} />}>
        <Route path="" element={<Home />} />
        {/* <Route path="product/:id" element={<ProductDetail />} /> */}
        <Route path="products" element={<Outlet />}>
          <Route index element={<ProductList />} /> {/* /products */}
          <Route path=":slug" element={<ProductDetail />} />
        </Route>

        <Route path="categories" element={<Category />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccess />} />
        {/* cart cho cả guest */}
        <Route path="carts" element={<Cart />} />
        <Route path="account" element={user ? <AccountCustomer /> : <Login />}>
          <Route path="profile" element={user ? <Profile /> : <Login />} />
          <Route path="orders" element={user ? <Order /> : <Login />} />
          <Route path="orders/:orderId" element={user ? <OrderDetail /> : <Login />} />
          <Route path="carts" element={user ? <Cart /> : <Login />} />
          <Route path="favorites" element={user ? <Favorite /> : <Login />} />
        </Route>
        
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
