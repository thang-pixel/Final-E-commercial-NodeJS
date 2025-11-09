import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function PrivateRoute({ role }) {
  const { user } = useSelector((state) => state.auth);
  console.log("PrivateRoute user:", user, "required role:", role);
  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) return <Navigate to="/" />;

  return <Outlet />;
}

export default PrivateRoute;