import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard"; 
import PrivateRoute from "./PrivateRoute";
import useAuth from "../hooks/authHook";
import ErrorPage from "../pages/ErrorPage";
import Logout from "../pages/Logout";
import Login from "../pages/Login";
import ProductList from "../pages/admin/Product";
import CategoryList from "../pages/admin/Category";
import PromotionList from "../pages/admin/Promotion";
import CustomerList from "../pages/admin/Customer";
import BrandList from "../pages/admin/Brand";
import OrderList from "../pages/admin/Order";
import Notification from "../pages/admin/Notification";
import Setting from "../pages/admin/Setting";
import ReportList from "../pages/admin/Report";

function AdminRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={ <Login />} />
      <Route path="/logout" element={ <Logout />} />
      <Route element={<PrivateRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout user={user} />}>
        
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Dashboard />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="products" element={<ProductList/>} />
          <Route path="customers" element= {<CustomerList />}/>
          <Route path="orders" element= {<OrderList />}/>
          <Route path="notifications" element= {<Notification />}/>
          <Route path="promotions" element={<PromotionList />} />
          <Route path="reports" element={<ReportList />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Route>
      <Route path="*" element={ <ErrorPage role={user?.role} status={404} message="Page Not Found" />} />
    </Routes>
  );
}
export default AdminRoutes;
