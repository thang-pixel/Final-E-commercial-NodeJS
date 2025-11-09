import { Routes, Route } from "react-router-dom";

import Home from "../pages/customer/home";
// import ProductDetail from "../pages/customer/ProductDetail";
import Cart from "../pages/customer/Cart";
import Profile from "../pages/customer/Profile";
import Order from "../pages/customer/Order";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import ErrorPage from "../pages/ErrorPage";
import useAuth from "../hooks/authHook";
import Login from "../pages/auth/Login";
import Logout from "../pages/auth/Logout";
import Category from "../pages/customer/Category";
import Register from "../pages/auth/Register";
import { RequireAuth, RequireGuest } from "./RequiredAuthRoute";
function CustomerRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Guest-only pages */}
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Ai cũng vào được (public for guests) với layout khách */}
      <Route path="/" element={<CustomerLayout user={user} />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Home />} />
        <Route path="categories" element={<Category />} />
        <Route path="carts" element={<Cart />} /> {/* guest vẫn xem/checkout */}
        
        {/* Private: bắt buộc login */}
        <Route element={<RequireAuth />}>
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Order />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Route>
      <Route
        path="/admin/*"
        element={<ErrorPage status={403} message="Forbidden Access" />}
      />
      <Route
        path="*"
        element={<ErrorPage status={404} message="Page Not Found" />}
      />
    </Routes>
  );
}

export default CustomerRoutes;
