// src/router/guards.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/authHook";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // hoặc spinner

  if (!user) {
    // đẩy khách sang /login và nhớ đường dẫn cũ để quay lại sau khi login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireGuest() {
  const { user, loading } = useAuth();
  if (loading) return null;

  // đã login thì không cho vào trang guest-only (login/register)
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
