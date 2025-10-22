import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import BrandList from "../pages/admin/Brand";
import CategoryList from "../pages/admin/Category";
import ProductList from "../pages/admin/Product";
import OrderList from "../pages/admin/Order";
import CustomerList from "../pages/admin/Customer";
import PromotionList from "../pages/admin/Promotion";
import ReportList from "../pages/admin/Report";
import Setting from "../pages/admin/Setting";
import Login from "../pages/Login"; 
import ErrorPage from "../pages/ErrorPage";
import Logout from "../pages/Logout";

const adminRoute = [
  {
    path: "/login",
    element: <Login />,
    title: "Đăng nhập"
  }, 
  {
    path: "/logout",
    element: <Logout />,
    title: "Đăng xuất"
  }, 
  {
    path: "/admin",
    element: <AdminLayout />,
    title: "Trang quản trị",
    children: [
      {
        path: "/home",
        element: <Dashboard />,
        title: "Trang chủ"
      },
      {
        path: "/brands",
        element: <BrandList />,
        title: "Thương hiệu"
      }, 
      {
        path: "/categories",
        element: <CategoryList />,
        title: "Danh mục"
      }, 
      {
        path: "/products",
        element: <ProductList />,
        title: "Sản phẩm"
      },
      {
        path: "/orders", 
        element: <OrderList />,
        title: "Đơn hàng"
      },
      {
        path: "/customers",
        element: <CustomerList />,
        title: "Khách hàng"
      },
      {
        path: "/promotions",
        element: <PromotionList />,
        title: "Khuyến mãi"
      },
      {
        path: "/reports",
        element: <ReportList />,
        title: "Báo cáo, phân tích"
      },
      {
        path: "/settings",
        element: <Setting />,
        title: "Cài đặt"
      }      
    ],
  },
  {
    path: "*",
    element: <ErrorPage status={404} message={"Page Not Found"} />,
  },
];

export { adminRoute };