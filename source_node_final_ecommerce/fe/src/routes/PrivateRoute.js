// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'; 

function PrivateRoute({ role, user }) {
  

  // 3. Nếu có truyền prop role → check role
  // role có thể là string ("ADMIN") hoặc array (["ADMIN", "STAFF"])
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    console.log('Allowed Roles:', allowedRoles, 'User Role:', user?.role);
    if (!allowedRoles.includes(user?.role)) {
      // có login nhưng không đúng role
      return <Navigate to="/" replace />;
    }
  }

  // 4. Hợp lệ → render children route
  return <Outlet />;
}

export default PrivateRoute;
