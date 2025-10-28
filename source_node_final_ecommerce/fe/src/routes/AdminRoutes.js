import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import AddCategory from "../pages/admin/Category/AddCategory";
import EditCategory from "../pages/admin/Category/EditCategory";
import AddProduct from "../pages/admin/Product/AddProduct";
import EditProduct from "../pages/admin/Product/EditProduct";
import AddBrand from "../pages/admin/Brand/AddBrand";
import EditBrand from "../pages/admin/Brand/EditBrand";
import DetailProduct from "../pages/admin/Product/DetailProduct";

function AdminRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={ <Login />} />
      <Route path="/logout" element={ <Logout />} />
      <Route element={<PrivateRoute role="ADMIN" />}>
        <Route index element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout user={user} />}>
        
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Dashboard />} />
          <Route path="brands" element={<Outlet />} >
            <Route index element={<Navigate to="" replace />} />
            <Route path="add" element={<AddBrand />} />
            <Route path="edit" element={<EditBrand />} />
            <Route path="" element={<BrandList />} />z
          </Route>
          <Route path="categories" element={<Outlet />} >
            <Route index element={<Navigate to="" replace />} />
            <Route path="add" element={<AddCategory />} />
            <Route path="edit" element={<EditCategory />} />
            <Route path="" element={<CategoryList />} />
          </Route>
          <Route path="products" element={<Outlet/>} >
            <Route index element={<ProductList />} /> 
            <Route path="add" element={<AddProduct />} />
            <Route path="edit" element={<EditProduct />} />
            <Route path=":slug" element={<DetailProduct />} /> 
          </Route>
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
