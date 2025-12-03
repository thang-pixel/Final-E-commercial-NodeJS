import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import CustomerRoutes from "./CustomerRoutes";
import Login from "../pages/auth/Login";
import Logout from "../pages/auth/Logout";
import ResetPassword from "../pages/reset-password";
function AllRoute() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*" element={<CustomerRoutes />} />
    </Routes>
  );
}

export default AllRoute;