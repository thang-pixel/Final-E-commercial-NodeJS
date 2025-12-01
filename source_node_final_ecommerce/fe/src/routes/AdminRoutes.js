import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard"; 
import PrivateRoute from "./PrivateRoute"; 
import ErrorPage from "../pages/ErrorPage"; 
import ProductList from "../pages/admin/Product";
import CategoryList from "../pages/admin/Category";
import PromotionList from "../pages/admin/Promotion";
import CustomerList from "../pages/admin/Customer";
import BrandList from "../pages/admin/Brand";
import OrderList from "../pages/admin/Order";
import Notification from "../pages/admin/Notification";
import Setting from "../pages/admin/Setting";
import ReportList from "../pages/admin/Report";
import AddCategory from "../pages/admin/Category/AddCategory";
import EditCategory from "../pages/admin/Category/EditCategory";
import AddProduct from "../pages/admin/Product/AddProduct";
import EditProduct from "../pages/admin/Product/EditProduct";
import AddBrand from "../pages/admin/Brand/AddBrand";
import EditBrand from "../pages/admin/Brand/EditBrand";
import DetailProduct from "../pages/admin/Product/DetailProduct";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "../context/LoadingContext";
import { api } from "../api/axios";
import Profile from "../pages/customer/Profile";


function AdminRoutes() {
  // const { user } = useAuth(); 
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const { setSpinning } = useGlobalLoading();


  const token = window.localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        setCurrentUser(null);
        return;
      }
      setLoading(true)
      setSpinning(true)

      try {
        const resp = await api.get(`/api/users/me`);
        // tuỳ backend: resp.data có thể là { user: {...} } hoặc {...}
        const user = resp.data;
        console.log('User Admin: ', resp.data)

        setCurrentUser(user);
        setError(null);
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError(err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
        setSpinning(false)
      }
    };

    fetchUser();
  }, [token, setSpinning]);

  // 1. Đang loading → show gì đó
  if (loading) {
    return <div>Loading...</div>; // bạn có thể đổi thành spinner đẹp hơn
  }

  // 2. Không có token hoặc gọi /me fail → đá về login (hoặc home tuỳ bạn)
  if (!token || error || !currentUser) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return (
    <Routes> 
      <Route element={<PrivateRoute role="admin" user={currentUser} />}>
        <Route element={<AdminLayout user={currentUser} />}>
          <Route index element={<Navigate to="" replace />} />
          <Route path="" element={<Dashboard />} />
          <Route path="home" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="brands" element={<Outlet />}>
            <Route index element={<BrandList />} />
            <Route path="add" element={<AddBrand />} />
            <Route path="edit/:id" element={<EditBrand />} />
          </Route>
          <Route path="categories" element={<Outlet />}>
            <Route index element={<CategoryList />} />
            <Route path="add" element={<AddCategory />} />
            <Route path="edit/:id" element={<EditCategory />} />
          </Route>
          <Route path="products" element={<Outlet />}>
            <Route index element={<ProductList />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="edit/:id" element={<EditProduct />} />
            <Route path=":id/detail" element={<DetailProduct />} />
          </Route>
          <Route path="customers" element={<CustomerList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="promotions" element={<PromotionList />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage status={404} message="Page Not Found" />} />
    </Routes>
  );
}
export default AdminRoutes;