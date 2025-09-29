import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import Users from "../pages/admin/Users";
import Categories from "../pages/admin/Categories";
import Promotions from "../pages/admin/Promotions";
import PrivateRoute from "./PrivateRoute";
import useAuth from "../hooks/authHook";
import ErrorPage from "../pages/ErrorPage";
import Logout from "../pages/Logout";
import Login from "../pages/Login";

function AdminRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={ <Login />} />
      <Route path="/logout" element={ <Logout />} />
      <Route element={<PrivateRoute role="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout user={user} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="users" element={<Users />} />
          <Route path="categories" element={<Categories />} />
          <Route path="promotions" element={<Promotions />} />
        </Route>
      </Route>
      <Route path="*" element={ <ErrorPage status={404} message="Page Not Found" />} />
    </Routes>
  );
}
export default AdminRoutes;
