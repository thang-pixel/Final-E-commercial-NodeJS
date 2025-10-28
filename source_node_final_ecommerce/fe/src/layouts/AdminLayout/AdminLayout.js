import { Link, Outlet, useLocation } from "react-router-dom";
import "./AdminLayout.css";
import AdminFooter from "../../components/admin/AdminFooter";
import AdminMenu from "../../components/admin/AdminMenu";
import { LeftCircleOutlined, MenuOutlined, DownOutlined } from "@ant-design/icons";
import {
  Layout, Breadcrumb, Dropdown, Space, ConfigProvider, theme, Drawer, Grid
} from "antd";
import { useMemo, useState } from "react";
import { LightMode, NotificationsNone, Person } from "@mui/icons-material";
import Badge from "@mui/material/Badge";

const { Sider, Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function AdminLayout({ user }) {
  const location = useLocation();
  const screens = useBreakpoint();

  // desktop collapse
  const [collapsed, setCollapsed] = useState(false);
  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDesktop = screens.lg;   // lg: ≥1024px

  const title = useMemo(() => {
    const map = new Map([
      ["/admin/home", "Trang chủ"],
      ["/admin/products", "Sản phẩm"],
      ["/admin/brands", "Thương hiệu"],
      ["/admin/categories", "Danh mục"],
      ["/admin/orders", "Đơn hàng"],
      ["/admin/customers", "Khách hàng"],
      ["/admin/promotions", "Khuyến mãi"],
      ["/admin/reports", "Báo cáo"],
      ["/admin/notifications", "Thông báo"],
      ["/admin/settings", "Cài đặt"],
    ]);
    for (const [p, t] of map.entries()) {
      if (location.pathname === p || location.pathname.startsWith(p + "/")) return t;
    }
    return "Dashboard";
  }, [location.pathname]);

  const crumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const acc = [];
    let cur = "";
    for (const part of parts) {
      cur += `/${part}`;
      acc.push({ path: cur, label: part });
    }
    return acc;
  }, [location.pathname]);

  const userMenuItems = [
    { key: "profile", label: <Link to="/profile">Hồ sơ của tôi</Link> },
    { type: "divider" },
    { key: "logout", label: <Link to="/logout">Đăng xuất</Link>, danger: true },
  ];

  // đóng Drawer khi đổi route
  // (nếu bạn dùng v6.22+, có thể dùng useNavigationType để tinh hơn)
  if (mobileOpen && isDesktop) setMobileOpen(false);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { borderRadius: 12, colorPrimary: "#06b6d4" },
        components: {
          Layout: { siderBg: "#fff", headerBg: "#fff", bodyBg: "#f1f5f9" },
          Menu: { itemBorderRadius: 10 }
        }
      }}
    >
      <Layout className="admin-layout">
        {/* Desktop Sider */}
        {isDesktop && (
          <Sider
            width={248}
            collapsedWidth={64}
            collapsible
            collapsed={collapsed}
            trigger={null}
            className="admin-sider"
            style={{
              position: "fixed", insetInlineStart: 0, top: 0, bottom: 0,
              paddingInline: 8, paddingTop: 8
            }}
          >
            <Link to="/admin/home" className="sider-logo">
              <img src="/logo192.png" alt="Logo" />
              <span className={`logo-text ${collapsed ? "is-collapsed" : ""}`}>Quản trị viên</span>
            </Link>

            <AdminMenu collapsed={collapsed} />

            <button
              className="sider-toggle"
              onClick={() => setCollapsed(v => !v)}
              aria-label="Toggle sidebar"
            >
              <LeftCircleOutlined rotate={collapsed ? 180 : 0} />
            </button>
          </Sider>
        )}

        {/* Main area */}
        <Layout
          style={{
            marginInlineStart: isDesktop ? (collapsed ? 64 : 248) : 0,
            transition: "margin 220ms cubic-bezier(0.2,0,0,1)",
            minHeight: "100vh",
          }}
        >
          <Header
            className="admin-header"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#fff", position: "sticky", top: 0, zIndex: 10,
              paddingInline: 12, boxShadow: "0 4px 12px rgba(0,0,0,.06)"
            }}
          >
            {/* Hamburger trên mobile */}
            {!isDesktop ? (
              <button
                className="collapse-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <MenuOutlined />
              </button>
            ) : (
              <button
                className="collapse-btn"
                onClick={() => setCollapsed(v => !v)}
                aria-label="Toggle sidebar"
              >
                <LeftCircleOutlined rotate={collapsed ? 180 : 0} />
              </button>
            )}

            <h2 style={{ fontSize: 20, fontWeight: 700, marginInlineStart: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </h2>

            <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              {/* Ẩn bớt icon trên màn nhỏ nếu cần */}
              <div className="header-icon"><LightMode /></div>
              <div className="header-icon">
                <Badge badgeContent={4} color="error">
                  <NotificationsNone />
                </Badge>
              </div>
              <Dropdown placement="bottomRight" menu={{ items: userMenuItems }}>
                <a href="/profile" onClick={(e) => e.preventDefault()} className="user-chip">
                  <Space>
                    <Person />
                    <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.username || "Admin"}
                    </span>
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </div>
          </Header>

          <Content style={{ padding: isDesktop ? 16 : 12 }}>
            {/* Breadcrumb: rút gọn trên mobile */}
            <div className="admin-breadcrumb card" style={{ display: isDesktop ? "block" : "none" }}>
              <Breadcrumb
                items={crumbs.map(c => ({
                  title: <Link to={c.path}>{decodeURIComponent(c.label)}</Link>,
                }))}
              />
            </div>

            <div className="admin-content card" style={{ marginTop: isDesktop ? 8 : 6 }}>
              <Outlet />
            </div>
          </Content>

          <Footer style={{ padding: 0, background: "transparent" }}>
            <AdminFooter />
          </Footer>
        </Layout>

        {/* Mobile Drawer thay cho Sider */}
        {!isDesktop && (
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            placement="left"
            width={260} 
          >
            <Link to="/admin/home" className="sider-logo" onClick={() => setMobileOpen(false)}>
              <img src="/logo192.png" alt="Logo" />
              <span className="logo-text">Quản trị viên</span>
            </Link>
            <AdminMenu
              collapsed={false}
              className=""
              // đóng drawer khi chọn menu (antd Menu v5 dùng onClick)
              onClick={() => setMobileOpen(false)}
            />
          </Drawer>
        )}
      </Layout>
    </ConfigProvider>
  );
}
