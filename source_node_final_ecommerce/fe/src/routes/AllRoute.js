import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import CustomerRoutes from "./CustomerRoutes";
import Login from "../pages/auth/Login";
import Logout from "../pages/auth/Logout";
import ResetPassword from "../pages/reset-password";
import ErrorPage from "../pages/ErrorPage";
function AllRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/forbidden" element={<ErrorPage status={403} message='Không có quyền truy cập' />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}

export default AllRoute;