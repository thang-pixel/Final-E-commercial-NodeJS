# Hướng Dẫn Cấu Trúc Layout FE – Giải Thích Chi Tiết

> Tài liệu này giải thích **mối liên hệ giữa Layout, Page, Component và Routes**  
> trong dự án React (fe/src), theo đúng cấu trúc hiện tại của đồ án.  
> Mục tiêu: bạn có thể áp dụng lại cấu trúc này cho **bất kỳ đồ án React nào**.

---

## 1. Tổng Quan Kiến Trúc

```
index.js          ← Điểm khởi đầu, bọc toàn bộ app
  └── App.js      ← Khởi tạo theme, kiểm tra auth từ localStorage
       └── AllRoute.js          ← Phân chia 2 nhánh: admin / customer
            ├── AdminRoutes.js  ← Toàn bộ routes cho admin panel
            └── CustomerRoutes.js ← Toàn bộ routes cho khách hàng
```

**Lớp Providers bọc ngoài (index.js → App.js):**

```
<Provider store={store}>        ← Redux (quản lý state toàn cục)
  <BrowserRouter>               ← React Router (điều hướng URL)
    <App>                       ← Component gốc
      <ThemeProvider>           ← MUI Theme (màu sắc, font)
        <CssBaseline />         ← Reset CSS chuẩn
        <AllRoute />            ← Tất cả các routes
```

---

## 2. Cấu Trúc Thư Mục `fe/src`

```
fe/src/
├── index.js              ← Entry point (ReactDOM.createRoot)
├── App.js                ← Root component, restore auth từ localStorage
│
├── routes/               ← 🗺️ ĐỊNH NGHĨA ĐƯỜNG ĐI
│   ├── AllRoute.js       ← Router gốc: phân nhánh /admin/* vs /*
│   ├── AdminRoutes.js    ← Tất cả routes của admin
│   ├── CustomerRoutes.js ← Tất cả routes của khách hàng
│   └── PrivateRoute.js   ← Bảo vệ route (kiểm tra đăng nhập & vai trò)
│
├── layouts/              ← 🖼️ KHUNG GIAO DIỆN (Navbar + Sidebar + Footer)
│   ├── AdminLayout/
│   │   ├── AdminLayout.js    ← Layout cho admin (sidebar, header)
│   │   └── AdminLayout.css
│   ├── CustomerLayout/
│   │   ├── CustomerLayout.js ← Layout cho khách (navbar top, footer)
│   │   └── CustomerLayout.css
│   └── LayoutDefault/
│       ├── LayoutDefault.js  ← Layout đặc biệt (trang thanh toán...)
│       └── LayoutDefault.scss
│
├── pages/                ← 📄 NỘI DUNG TRANG (chỉ render nội dung chính)
│   ├── admin/            ← Dashboard, Product, Brand, Category, Order...
│   ├── customer/         ← Home, Cart, Order, Profile, Category...
│   ├── auth/             ← Login, Register, Logout
│   └── ErrorPage/        ← 404, 401
│
├── components/           ← 🧩 THÀNH PHẦN TÁI SỬ DỤNG
│   ├── admin/            ← AdminFooter, AdminMenu, AdminSidebar
│   ├── customer/         ← CustomerFooter, CustomerNavbar, SearchHome
│   └── common/           ← ButtonCustom, InputCustom, ModalCustom, ProductCard
│
├── redux/                ← 🗃️ QUẢN LÝ STATE
│   ├── store.js
│   ├── reducers/         ← authSlice, cartSlice...
│   └── actions/
│
├── hooks/                ← 🎣 CUSTOM HOOKS
│   └── authHook.js       ← useAuth() – lấy user & token từ Redux
│
├── config/
│   └── theme.js          ← Cấu hình màu sắc MUI
│
└── utils/
    ├── request.js        ← Axios instance
    └── formatCurrencyUtil.js
```

---

## 3. Cơ Chế Hoạt Động: `<Outlet />` – Chìa Khóa Của Layout Pattern

> Đây là khái niệm **quan trọng nhất** để hiểu cách Layout bọc Page.

### Nguyên tắc cơ bản (React Router v6):

Khi một Route có `element={<Layout />}` và bên trong có các Route con, React Router sẽ **render nội dung của Route con vào đúng vị trí `<Outlet />`** trong Layout.

```jsx
// CustomerRoutes.js
<Route path="/" element={<CustomerLayout user={user} />}>
    <Route path="" element={<Home />} />       ← Khi vào /
    <Route path="carts" element={<Cart />} />  ← Khi vào /carts
    <Route path="orders" element={<Order />} /> ← Khi vào /orders
</Route>
```

```jsx
// CustomerLayout.js – Layout render <Outlet /> ở giữa
function CustomerLayout(props) {
    return (
        <div>
            <header>  {/* Navbar cố định – LUÔN hiển thị */}
                ...Logo, Menu, SearchBar, Cart icon...
            </header>

            <main>
                <Outlet />  {/* ← HOME / CART / ORDER / ... sẽ render vào đây */}
            </main>

            <footer>  {/* Footer cố định – LUÔN hiển thị */}
                <CustomerFooter />
            </footer>
        </div>
    );
}
```

**Kết quả render khi người dùng vào `/carts`:**
```
┌──────────────────────────────────────────┐
│  HEADER (Navbar: Logo + Menu + Search)   │  ← từ CustomerLayout
├──────────────────────────────────────────┤
│                                          │
│          <Cart />  ← <Outlet />          │  ← từ CartPage
│                                          │
├──────────────────────────────────────────┤
│           FOOTER (CustomerFooter)        │  ← từ CustomerLayout
└──────────────────────────────────────────┘
```

---

## 4. Sơ Đồ Mối Liên Hệ Đầy Đủ

```
index.js
│
├─ <Provider store={store}>          ← Redux
│   └─ <BrowserRouter>               ← React Router
│       └─ <App />
│           └─ <ThemeProvider>
│               └─ <AllRoute />
│                   │
│                   ├─ path="/admin/*"  →  <AdminRoutes />
│                   │       │
│                   │       ├─ /admin/login          → <Login />      (public)
│                   │       ├─ /admin/logout         → <Logout />     (public)
│                   │       └─ <PrivateRoute role="admin">             (protected)
│                   │               └─ <AdminLayout user={user}>
│                   │                       │
│                   │                       ├─ SIDEBAR (AdminMenu)      ← component
│                   │                       ├─ HEADER (title, breadcrumb, user)
│                   │                       ├─ <Outlet />  ← các page admin render vào đây
│                   │                       │       ├─ /admin/home      → <Dashboard />
│                   │                       │       ├─ /admin/products  → <ProductList />
│                   │                       │       ├─ /admin/brands    → <BrandList />
│                   │                       │       └─ ...
│                   │                       └─ FOOTER (AdminFooter)     ← component
│                   │
│                   └─ path="/*"      →  <CustomerRoutes />
│                           │
│                           ├─ /login          → <Login />    (public)
│                           ├─ /register       → <Register /> (public)
│                           ├─ /logout         → <Logout />   (public)
│                           └─ <CustomerLayout user={user}>  (public – không cần đăng nhập)
│                                   │
│                                   ├─ HEADER (Logo, CategoryMenu, SearchBar, Cart, Profile)
│                                   │       └─ dùng: SearchHome, CategoryDrawer   ← components
│                                   ├─ <Outlet />  ← các page customer render vào đây
│                                   │       ├─ /            → <Home />
│                                   │       ├─ /carts       → <Cart />
│                                   │       ├─ /orders      → <Order />
│                                   │       ├─ /categories  → <Category />
│                                   │       └─ /profile     → <Profile />
│                                   └─ FOOTER (CustomerFooter)  ← component
```

---

## 5. Chi Tiết Từng Tầng

### 5.1. `index.js` – Điểm Khởi Đầu

```jsx
// fe/src/index.js
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>       {/* ← Redux state management */}
    <BrowserRouter>              {/* ← Bật tính năng điều hướng URL */}
      <App />
    </BrowserRouter>
  </Provider>
);
```

**Vai trò:** Bọc toàn bộ ứng dụng với hai provider thiết yếu:
- `Provider`: cho phép mọi component con đọc/ghi Redux state
- `BrowserRouter`: cho phép dùng `useNavigate`, `Link`, `Route`...

---

### 5.2. `App.js` – Khôi Phục Phiên Đăng Nhập

```jsx
// fe/src/App.js
function App() {
    const dispatch = useDispatch();

    // Khi F5 / mở lại tab → kiểm tra localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        const user  = localStorage.getItem("user");
        if (token && user) {
            dispatch(login({ user: JSON.parse(user), token }));
            // → Redux state: { auth: { user, token } }
        }
    }, [dispatch]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AllRoute />   {/* ← Tất cả routes từ đây */}
        </ThemeProvider>
    );
}
```

**Vai trò:**  
- Tự động đăng nhập lại nếu có token trong localStorage  
- Bọc UI với MUI ThemeProvider (màu cyan, border-radius...)

---

### 5.3. `AllRoute.js` – Router Gốc

```jsx
// fe/src/routes/AllRoute.js
function AllRoute() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />  {/* Nhánh admin */}
      <Route path="/*"       element={<CustomerRoutes />} /> {/* Nhánh khách */}
    </Routes>
  );
}
```

**Vai trò:** "Ngã ba đường" – phân luồng dựa trên URL prefix:
- `/admin/...` → đến `AdminRoutes`
- Bất kỳ URL nào khác → đến `CustomerRoutes`

---

### 5.4. `PrivateRoute.js` – Bảo Vệ Route

```jsx
// fe/src/routes/PrivateRoute.js
function PrivateRoute({ role }) {
  const { user } = useSelector((state) => state.auth);  // Đọc từ Redux

  if (!user)              return <Navigate to="/login" />;  // Chưa đăng nhập
  if (role && user.role !== role) return <Navigate to="/" />; // Sai vai trò

  return <Outlet />;  // Đủ điều kiện → render route con
}
```

**Vai trò:** "Bảo vệ" – chỉ cho phép vào nếu:
1. Đã đăng nhập (user tồn tại trong Redux)
2. Vai trò người dùng khớp với `role` yêu cầu (`"admin"`)

**Cách dùng trong AdminRoutes:**
```jsx
<Route element={<PrivateRoute role="admin" />}>
    <Route path="/" element={<AdminLayout user={user} />}>
        ...các route admin...
    </Route>
</Route>
```

---

### 5.5. `AdminRoutes.js` – Routes Admin

```jsx
// fe/src/routes/AdminRoutes.js
function AdminRoutes() {
  const { user } = useAuth();  // Hook lấy user từ Redux

  return (
    <Routes>
      {/* PUBLIC: không cần đăng nhập */}
      <Route path="/login"  element={<Login />} />
      <Route path="/logout" element={<Logout />} />

      {/* PROTECTED: phải là admin */}
      <Route element={<PrivateRoute role="admin" />}>
        <Route path="/" element={<AdminLayout user={user} />}>

          {/* Index redirect */}
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Dashboard />} />

          {/* Products – có nested routes */}
          <Route path="products" element={<Outlet />}>
            <Route index element={<ProductList />} />
            <Route path="add"        element={<AddProduct />} />
            <Route path="edit/:id"   element={<EditProduct />} />
            <Route path=":slug"      element={<DetailProduct />} />
          </Route>

          {/* Brands */}
          <Route path="brands" element={<Outlet />}>
            <Route index element={<BrandList />} />
            <Route path="add"      element={<AddBrand />} />
            <Route path="edit/:id" element={<EditBrand />} />
          </Route>

          {/* Các route đơn giản */}
          <Route path="customers"     element={<CustomerList />} />
          <Route path="orders"        element={<OrderList />} />
          <Route path="promotions"    element={<PromotionList />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="reports"       element={<ReportList />} />
          <Route path="settings"      element={<Setting />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<ErrorPage status={404} />} />
    </Routes>
  );
}
```

---

### 5.6. `CustomerRoutes.js` – Routes Khách Hàng

```jsx
// fe/src/routes/CustomerRoutes.js
function CustomerRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* PUBLIC: trang auth riêng, KHÔNG dùng CustomerLayout */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout"   element={<Logout />} />

      {/* MAIN: bọc trong CustomerLayout */}
      <Route path="/" element={<CustomerLayout user={user} />}>
        <Route path=""           element={<Home />} />
        <Route path="products"   element={<Home />} />
        <Route path="categories" element={<Category />} />
        <Route path="carts"      element={<Cart />} />
        <Route path="profile"    element={<Profile />} />
        <Route path="orders"     element={<Order />} />
      </Route>

      {/* Error routes */}
      <Route path="/admin/*" element={<ErrorPage status={401} message="Unauthorized" />} />
      <Route path="*"        element={<ErrorPage status={404} message="Not Found" />} />
    </Routes>
  );
}
```

**Lưu ý quan trọng:** `/login`, `/register`, `/logout` được khai báo **ngoài** `<Route element={<CustomerLayout />}>` vì những trang này có giao diện riêng, không cần Navbar/Footer của CustomerLayout.

---

### 5.7. `CustomerLayout.js` – Layout Khách Hàng

```jsx
// fe/src/layouts/CustomerLayout/CustomerLayout.js
function CustomerLayout(props) {
    const { user } = props;  // ← Nhận user từ CustomerRoutes

    return (
        <div className="layout-customer flex flex-col min-h-screen">

            {/* HEADER – cố định (fixed) */}
            <header className="layout-customer__header fixed w-full bg-cyan-400 h-16 z-10">
                <nav>
                    {/* Logo */}
                    <Link to="/">My Shop</Link>

                    {/* Menu items – dùng component SearchHome từ components/customer */}
                    <div onClick={() => setIsOpen(true)}>
                        <Link to="/categories">Danh mục</Link>
                    </div>
                    <SearchHome />   {/* ← Component tái sử dụng */}

                    {/* Giỏ hàng */}
                    <Link to="/carts">Giỏ hàng</Link>

                    {/* Tài khoản */}
                    <div className="nav-item--account">
                        <Link to="/profile">Chào {user?.username || "Khách"}!</Link>
                        <div className="menuProfile"> {/* Dropdown menu */}
                            ...Tài khoản / Đơn hàng / Đăng xuất...
                        </div>
                    </div>
                </nav>
            </header>

            {/* MAIN – nơi các Page được render vào */}
            <main className="layout-customer__main container mx-auto">
                <CategoryDrawer ... />   {/* ← Component drawer danh mục */}
                <Outlet context={{ props }} />  {/* ← PAGE RENDER Ở ĐÂY */}
            </main>

            {/* FOOTER */}
            <footer>
                <CustomerFooter />  {/* ← Component tái sử dụng */}
            </footer>
        </div>
    );
}
```

**Tóm tắt:** CustomerLayout = Header + `<Outlet />` + Footer  
Mọi page trong `/` đều render vào `<Outlet />`

---

### 5.8. `AdminLayout.js` – Layout Admin

```jsx
// fe/src/layouts/AdminLayout/AdminLayout.js
export default function AdminLayout({ user }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useBreakpoint().lg;  // Responsive: ≥1024px

  // Tính tiêu đề trang dựa trên URL
  const title = useMemo(() => {
    const map = new Map([
      ["/admin/home",       "Trang chủ"],
      ["/admin/products",   "Sản phẩm"],
      ["/admin/brands",     "Thương hiệu"],
      ...
    ]);
    for (const [path, label] of map.entries()) {
      if (location.pathname.startsWith(path)) return label;
    }
    return "Dashboard";
  }, [location.pathname]);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#06b6d4" } }}>
      <Layout className="admin-layout">

        {/* SIDEBAR – chỉ desktop */}
        {isDesktop && (
          <Sider collapsed={collapsed} style={{ position: "fixed" }}>
            <Link to="/admin/home">Quản trị viên</Link>
            <AdminMenu collapsed={collapsed} />  {/* ← Component menu */}
            <button onClick={() => setCollapsed(v => !v)}>Toggle</button>
          </Sider>
        )}

        {/* MAIN AREA */}
        <Layout style={{ marginInlineStart: isDesktop ? (collapsed ? 64 : 248) : 0 }}>

          {/* HEADER */}
          <Header>
            {/* Hamburger (mobile) hoặc toggle (desktop) */}
            <h2>{title}</h2>  {/* Tiêu đề trang động */}
            <Badge><NotificationsNone /></Badge>
            <Dropdown menu={{ items: userMenuItems }}>
              {user?.username || "Admin"}
            </Dropdown>
          </Header>

          {/* CONTENT */}
          <Content>
            <Breadcrumb ... />   {/* Breadcrumb động từ URL */}
            <div className="admin-content card">
              <Outlet />         {/* ← PAGE RENDER Ở ĐÂY */}
            </div>
          </Content>

          <Footer><AdminFooter /></Footer>  {/* ← Component */}
        </Layout>

        {/* DRAWER – chỉ mobile */}
        {!isDesktop && (
          <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
            <AdminMenu onClick={() => setMobileOpen(false)} />
          </Drawer>
        )}

      </Layout>
    </ConfigProvider>
  );
}
```

---

### 5.9. Pages – Nội Dung Trang

Các Page **KHÔNG chứa** Navbar, Sidebar hay Footer. Chúng chỉ render **nội dung nghiệp vụ** và được inject vào `<Outlet />` của Layout.

```jsx
// fe/src/pages/customer/Cart/index.js
function Cart() {
    return (
        <>
            <h1 className="text-center font-bold capitalize">Cart Page</h1>
            {/* Nội dung giỏ hàng ... */}
        </>
    );
}
export default Cart;
```

```jsx
// fe/src/pages/admin/Dashboard/index.js
function Dashboard() {
    return (
        <>
            <h1>Admin Dashboard</h1>
            {/* Thống kê, biểu đồ ... */}
        </>
    );
}
export default Dashboard;
```

---

### 5.10. Components – Thành Phần Tái Sử Dụng

Components là các khối UI nhỏ, được dùng lại trong cả Layout lẫn Pages.

| Thư mục | Component | Được dùng ở đâu |
|---------|-----------|----------------|
| `components/customer/` | `CustomerFooter.js` | CustomerLayout (footer) |
| `components/customer/` | `SearchHome.js` | CustomerLayout (header) |
| `components/customer/` | `CustomerNavbar.js` | *(tham khảo)* |
| `components/admin/` | `AdminMenu.js` | AdminLayout (sidebar + mobile drawer) |
| `components/admin/` | `AdminFooter.js` | AdminLayout (footer) |
| `components/admin/` | `AdminSidebar.js` | *(tham khảo)* |
| `components/common/` | `ButtonCustom.js` | Nhiều pages |
| `components/common/` | `InputCustom.js` | Nhiều pages |
| `components/common/` | `ModalCustom.js` | Nhiều pages |
| `components/common/` | `ProductCard.js` | Home, Category pages |

---

## 6. Luồng Render Khi Người Dùng Truy Cập URL

### Ví dụ: Người dùng vào `/carts`

```
1. URL = /carts
2. AllRoute.js  → path="/*" khớp → render <CustomerRoutes />
3. CustomerRoutes.js → path="/" khớp → render <CustomerLayout user={user} />
4. CustomerLayout.js → render Header + Footer, và <Outlet /> ở giữa
5. CustomerRoutes.js → path="carts" (route con) → inject <Cart /> vào <Outlet />
6. Kết quả: Header [navbar] + Cart [nội dung] + Footer
```

### Ví dụ: Admin vào `/admin/products/add`

```
1. URL = /admin/products/add
2. AllRoute.js  → path="/admin/*" khớp → render <AdminRoutes />
3. AdminRoutes.js → <PrivateRoute role="admin" /> kiểm tra:
   - user có trong Redux? → có
   - user.role === "admin"? → có
   → render <Outlet /> (tức là các route con)
4. AdminRoutes.js → path="/" khớp → render <AdminLayout user={user} />
5. AdminLayout.js → render Sidebar + Header + Footer, và <Outlet /> ở giữa
6. AdminRoutes.js → path="products" khớp → render <Outlet /> (nested)
7. AdminRoutes.js → path="add" khớp → inject <AddProduct /> vào <Outlet />
8. Kết quả: Sidebar + Header [title="Sản phẩm"] + AddProduct [form] + Footer
```

### Ví dụ: User chưa đăng nhập vào `/admin/home`

```
1. URL = /admin/home
2. AllRoute.js → AdminRoutes
3. PrivateRoute: user = null → <Navigate to="/login" />
4. Kết quả: Redirect sang /login
```

---

## 7. Cách Truyền Data Từ Route Xuống Layout và Page

### 7.1. Truyền `user` xuống Layout (qua props)

```jsx
// AdminRoutes.js
const { user } = useAuth();  // lấy từ Redux
<Route path="/" element={<AdminLayout user={user} />}>
```

```jsx
// AdminLayout.js
export default function AdminLayout({ user }) {
    // user.username, user.role...
}
```

### 7.2. Truyền data xuống Page (qua Outlet context)

```jsx
// CustomerLayout.js
<Outlet context={{ props }} />
```

```jsx
// Bất kỳ Page nào bên trong CustomerLayout
import { useOutletContext } from 'react-router-dom';

function Cart() {
    const { props } = useOutletContext();
    const { user } = props;
    // Sử dụng user...
}
```

### 7.3. Lấy params từ URL trong Page

```jsx
// Route: <Route path="edit/:id" element={<EditProduct />} />
import { useParams } from 'react-router-dom';

function EditProduct() {
    const { id } = useParams();  // Lấy :id từ URL /admin/products/edit/123
}
```

---

## 8. Auth Hook – `useAuth()`

```jsx
// fe/src/hooks/authHook.js
import { useSelector } from 'react-redux';

function useAuth() {
    const { user, token } = useSelector((state) => state.auth);
    const isLoggedIn = !!token;
    return { user, token, isLoggedIn };
}

export default useAuth;
```

**Vai trò:** Đọc trạng thái đăng nhập từ Redux store. Được dùng trong các Route files để lấy `user` truyền vào Layout.

---

## 9. Sơ Đồ Luồng Dữ Liệu Auth

```
1. Đăng nhập thành công (Login page)
   ↓ dispatch(login({ user, token }))
   ↓ Redux: state.auth = { user, token }
   ↓ localStorage.setItem("token", token)
   ↓ localStorage.setItem("user", JSON.stringify(user))

2. F5 / Reload trang (App.js useEffect)
   ↓ localStorage.getItem("token") → có
   ↓ dispatch(login({ user, token }))
   ↓ Redux được khôi phục

3. Vào route protected (PrivateRoute)
   ↓ useSelector(state.auth.user) → có
   ↓ user.role === "admin" → đúng
   ↓ render Outlet (layout + page)

4. Đăng xuất (Logout page)
   ↓ dispatch(logout())
   ↓ Redux: state.auth = { user: null, token: null }
   ↓ localStorage.removeItem("token")
   ↓ navigate("/login")
```

---

## 10. Áp Dụng Cho Đồ Án Khác – Template Chuẩn

Để tạo một dự án React mới theo cấu trúc này, làm theo các bước sau:

### Bước 1: Tạo cấu trúc thư mục

```
src/
├── routes/
│   ├── AllRoute.js
│   ├── MainRoutes.js       ← (thay CustomerRoutes)
│   ├── DashboardRoutes.js  ← (thay AdminRoutes)
│   └── PrivateRoute.js
├── layouts/
│   ├── MainLayout/
│   │   └── MainLayout.js
│   └── DashboardLayout/
│       └── DashboardLayout.js
├── pages/
│   ├── auth/    (Login, Register, Logout)
│   ├── main/    (Home, Detail, Profile...)
│   └── dashboard/ (Overview, Management...)
├── components/
│   ├── common/  (Button, Input, Modal...)
│   ├── main/    (Navbar, Footer, SearchBar...)
│   └── dashboard/ (Sidebar, Menu, Header...)
├── redux/
│   ├── store.js
│   └── reducers/authSlice.js
└── hooks/
    └── authHook.js
```

### Bước 2: Tạo Layout với `<Outlet />`

```jsx
// layouts/MainLayout/MainLayout.js
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/main/Navbar';
import Footer from '../../components/main/Footer';

function MainLayout({ user }) {
    return (
        <div>
            <Navbar user={user} />
            <main>
                <Outlet />   {/* ← Pages render vào đây */}
            </main>
            <Footer />
        </div>
    );
}
export default MainLayout;
```

### Bước 3: Tạo Routes và gắn Layout

```jsx
// routes/MainRoutes.js
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';
import useAuth from '../hooks/authHook';
import Home from '../pages/main/Home';
import Profile from '../pages/main/Profile';

function MainRoutes() {
    const { user } = useAuth();
    return (
        <Routes>
            {/* Trang không cần layout */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Trang có layout */}
            <Route path="/" element={<MainLayout user={user} />}>
                <Route path=""        element={<Home />} />
                <Route path="profile" element={<Profile />} />
                {/* ... thêm page khác */}
            </Route>
        </Routes>
    );
}
export default MainRoutes;
```

### Bước 4: Tạo PrivateRoute cho dashboard

```jsx
// routes/PrivateRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function PrivateRoute({ role }) {
    const { user } = useSelector((state) => state.auth);
    if (!user)                     return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return <Outlet />;
}
export default PrivateRoute;
```

### Bước 5: Kết hợp trong AllRoute

```jsx
// routes/AllRoute.js
import { Routes, Route } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import DashboardRoutes from './DashboardRoutes';

function AllRoute() {
    return (
        <Routes>
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            <Route path="/*"           element={<MainRoutes />} />
        </Routes>
    );
}
export default AllRoute;
```

### Bước 6: Bọc App trong index.js

```jsx
// index.js
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
```

---

## 11. Tóm Tắt Quy Tắc Quan Trọng

| Quy tắc | Mô tả |
|---------|-------|
| **Layout dùng `<Outlet />`** | Layout không biết page nào sẽ render vào – dùng `<Outlet />` làm placeholder |
| **Page không chứa layout** | Page chỉ render nội dung nghiệp vụ, không có navbar/sidebar |
| **Route con bên trong Route layout** | Để page được inject vào `<Outlet />`, route của page phải là **con** của route layout |
| **Trang auth không dùng layout** | `/login`, `/register` khai báo **ngoài** route layout |
| **PrivateRoute dùng `<Outlet />`** | PrivateRoute cũng render `<Outlet />` khi pass, cho phép route con bên trong tiếp tục render |
| **`useAuth()` lấy user từ Redux** | Không đọc localStorage trực tiếp – đọc qua Redux (App.js đã khôi phục) |
| **`user` truyền qua props** | Route truyền `user` xuống Layout để Layout hiển thị tên/avatar người dùng |

---

## 12. Checklist Khi Tạo Route Mới

```
☐ 1. Tạo file page trong pages/
☐ 2. Import page vào file Routes tương ứng
☐ 3. Thêm <Route path="..." element={<Page />} /> bên trong Route Layout
☐ 4. Nếu page cần bảo vệ → bọc trong <PrivateRoute role="..." />
☐ 5. Nếu page cần nested routes → dùng <Outlet /> trong element
☐ 6. Kiểm tra page không import layout (tránh double layout)
☐ 7. Test navigation bằng <Link to="..."> hoặc useNavigate()
```

---

*Tài liệu được tạo cho đồ án Final-E-commercial-NodeJS – FE React App*  
*Cấu trúc: React Router v6 + Redux Toolkit + Ant Design + MUI + Tailwind CSS*
