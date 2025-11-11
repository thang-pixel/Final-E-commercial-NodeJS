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
        <Route path="carts" element={<Cart />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Order />} />
      </Route>
      <Route
        path="/admin/*"
        element={<ErrorPage status={401} message="Unauthorized Access" />}
      />
      <Route
        path="*"
        element={<ErrorPage status={404} message="Page Not Found" />}
      />
    </Routes>
  );
}

export default CustomerRoutes;
