import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import './CustomerLayout.css';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { ACTIVE_PAGES } from '../../constants/pageContants';
import SearchHome from '../../components/customer/SearchHome';
import CategoryDrawer from '../../pages/customer/Category/CategoryDrawer';
import { Close, Menu, AccountCircle, ShoppingCart } from '@mui/icons-material';

function CustomerLayout(props) {
    const { user } = props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const categories = [
        'Điện thoại',
        'Laptop',
        'Tablet',
        'Phụ kiện',
        'Âm thanh',
        'Đồng hồ',
        'Thiết bị thông minh',
        'May mặc',
        'Giày dép',
        'Túi xách',
    ];
    // ESC để đóng + khóa scroll khi mở
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    const [activePage, setActivePage] = useState(ACTIVE_PAGES.home);
    const handleActivePage = (page) => {
        setActivePage(page);
    };

    const navItemClasses = clsx(
        'layout-customer__nav--item rounded-lg transition duration-300 ease-in-out',
        'hover:bg-white/20 hover:border-b-2 hover:font-semibold hover:border-white'
    );
    const activeNavItemClasses = clsx(
        ' bg-white/20 border-b-2 font-semibold border-white'
    );

    // const items = [
    //     {
    //         label: 'Danh mục',
    //         to: 'categories',
    //         page: ACTIVE_PAGES.categories,
    //         onClick: () => setIsOpen(true),
    //     },
    //     // { label: 'Sản phẩm', to: 'products', page: ACTIVE_PAGES.products },
    //     // { label: 'Đơn hàng', to: 'orders', page: ACTIVE_PAGES.orders },
    //     { label: 'Giỏ hàng', to: 'carts', page: ACTIVE_PAGES.carts },
    //     // { label: 'Đăng xuất', to: 'logout', page: null },
    //     // {
    //     //     label: `Chào ${user.username}!`,
    //     //     to: 'profile',
    //     //     page: ACTIVE_PAGES.profile,
    //     //     className: 'ml-auto',
    //     // },
    // ];

    const handleToggleNav = (isCollapsed) => {
        const hamburger = document.querySelector(
            '.layout-customer__nav--hamburger'
        );
        const close = document.querySelector('.layout-customer__nav--close');
        const navMenu = document.querySelector('.layout-customer__nav--menu');
  
        if (isCollapsed) {
            hamburger.style.display = 'none';
            close.style.display = 'block';
            navMenu.style.display = 'flex';
        } else {
            hamburger.style.display = 'block';
            close.style.display = 'none';
            navMenu.style.display = 'none';
        }
    };

    return (
        <div className="layout-customer flex flex-col items-stretch min-h-screen">
            <header className="layout-customer__header fixed w-full bg-cyan-400 h-16 z-10 ">
                <div className="layout-customer__nav container bg-inherit py-2 h-full w-full relative flex mx-auto  justify-between items-center gap-x-4 shadow-cyan-300">
                    <div className="layout-customer__nav--logo rounded-lg ">
                        <Link to="/">
                            <div className="flex flex-row p-2 bg-inherit justify-start items-center gap-2">
                                <div className="flex-shrink-0">
                                    <img
                                        src={'/logo192.png'}
                                        className="h-10 w-10 object-cover"
                                        alt="Logo"
                                    />
                                </div>
                                <div>
                                    <p className="p-2">My Shop</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                    <nav className="layout-customer__nav--menu flex flex-row gap-x-2  items-center w-full"> 
                        <div
                            onClick={() => setIsOpen(true)}
                            className={navItemClasses} 
                        >
                            <Link to={'/categories'} className='flex justify-center items-center'>
                                <img
                                    src={'/categories.png'}
                                    alt="Danh mục"
                                    className="h-6 w-6"
                                />
                                <p className="p-2">Danh mục</p>
                            </Link>
                        </div>
                         
                        <div className="nav-item--search m-auto bg-white rounded-md">
                            <SearchHome />
                        </div>

                        <div
                            onClick={() => handleActivePage(ACTIVE_PAGES.carts)}
                            className={navItemClasses + (activePage === ACTIVE_PAGES.carts ? activeNavItemClasses : '')} 
                        >
                            <Link to={'/carts'} className='flex justify-center items-center'>
                                <ShoppingCart />
                                <p className="p-2">Giỏ hàng</p>
                            </Link>
                        </div>

                        <div
                            className={'nav-item--account relative'}
                            onClick={() =>
                                handleActivePage(ACTIVE_PAGES.profile)
                            }
                        >
                            <Link to={'/profile'} className='flex justify-center items-center'>
                                <AccountCircle />
                                <p className="p-2">{`Chào ${user?.username || user?.full_name || user?.email || "Khách"}!`}</p>
                            </Link>
                            <div className="menuProfile bg-white rounded-md shadow-md absolute right-0 top-full mt-2 w-36 z-20">
                                <ul>
                                    {user && (
                                        <li className="hover:bg-gray-100 hover:text-cyan-400 p-2">
                                            
                                            <Link to={'/profile'}>Tài khoản của tôi</Link>
                                        </li>
                                    )}

                                    {user && (
                                        <li className="hover:bg-gray-100 hover:text-cyan-400 p-2">
                                            <Link to={'/orders'}>Đơn hàng của tôi</Link>
                                        </li>
                                    )}

                                    {user &&(
                                        <li className="hover:bg-gray-100 hover:text-cyan-400 p-2">
                                            <Link to={'/carts'}>Giỏ hàng của tôi</Link>
                                        </li>
                                    )}

                                    {user && (
                                        <li className="hover:bg-gray-100 hover:text-cyan-400 p-2">
                                            <Link to={'/logout'}>Đăng xuất</Link>
                                        </li>
                                    )}
                                    
                                    {!user && (
                                        <li className="hover:bg-gray-100 hover:text-cyan-400 p-2">
                                            <Link to={'/login'}>Đăng nhập</Link>
                                        </li>
                                    )}
                                    
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <div className="layout-customer__nav--hamburger mr-2">
                        <Menu
                            className="cursor-pointer"
                            onClick={() => handleToggleNav(true)}
                        />
                    </div>
                    <div className="layout-customer__nav--close mr-2">
                        <Close
                            className="cursor-pointer"
                            onClick={() => handleToggleNav(false)}
                        />
                    </div>
                </div>
            </header>

            <main className="layout-customer__main container mx-auto h-auto bg-teal-200 relative">
                <CategoryDrawer
                    cates={categories}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
                <Outlet context={{ props }} />
            </main>

            <footer className="layout-customer__footer  bg-gray-200">
                <CustomerFooter />
            </footer>
        </div>
    );
}

export default CustomerLayout;

// import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
// import { useMemo, useState } from "react";
// import AppBar from "@mui/material/AppBar";
// import Toolbar from "@mui/material/Toolbar";
// import Container from "@mui/material/Container";
// import IconButton from "@mui/material/IconButton";
// import Typography from "@mui/material/Typography";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import Drawer from "@mui/material/Drawer";
// import List from "@mui/material/List";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemText from "@mui/material/ListItemText";
// import Divider from "@mui/material/Divider";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { useTheme } from "@mui/material/styles";
// import MenuIcon from "@mui/icons-material/Menu";
// import CloseIcon from "@mui/icons-material/Close";

// const navItems = [
//   { label: "Sản phẩm", to: "/products" },
//   { label: "Đơn hàng", to: "/orders" },
// ];

// export default function CustomerLayout({ user }) {
//   const theme = useTheme();
//   const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
//   const [open, setOpen] = useState(false);
//   const location = useLocation();

//   const activePath = useMemo(() => location.pathname, [location.pathname]);

//   const toggleDrawer = (v) => () => setOpen(v);

//   const NavButtons = (
//     <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//       {navItems.map((item) => {
//         const isActive = activePath.startsWith(item.to);
//         return (
//           <Button
//             key={item.to}
//             component={NavLink}
//             to={item.to}
//             sx={{
//               textTransform: "none",
//               fontWeight: isActive ? 700 : 500,
//               borderBottom: isActive ? "2px solid currentColor" : "2px solid transparent",
//               borderRadius: 1,
//             }}
//             color="inherit"
//           >
//             {item.label}
//           </Button>
//         );
//       })}
//     </Box>
//   );

//   const AuthButtons = (
//     <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
//       {!user ? (
//         <Button component={Link} to="/login" color="inherit" sx={{ textTransform: "none" }}>
//           Đăng nhập
//         </Button>
//       ) : (
//         <>
//         <Button
//             key={"cart"}
//             component={NavLink}
//             to={"/cart"}
//             sx={{
//               textTransform: "none",
//               fontWeight: activePath.startsWith("/cart") ? 700 : 500,
//               borderBottom: activePath.startsWith("/cart") ? "2px solid currentColor" : "2px solid transparent",
//               borderRadius: 1,
//             }}
//             color="inherit"
//           >
//             Giỏ hàng
//           </Button>

//         <Button
//           component={Link}
//           to="/profile"
//           color="inherit"
//           sx={{ textTransform: "none", fontWeight: 600 }}
//         >
//           Chào {user.username}!
//         </Button>
//         </>
//       )}
//     </Box>
//   );

//   return (
//     <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
//       {/* AppBar */}
//       <AppBar position="fixed" color="primary" elevation={1}>
//         <Container maxWidth="lg">
//           <Toolbar disableGutters sx={{ gap: 2 }}>
//             {/* Logo + brand */}
//             <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
//               <Box
//                 component="img"
//                 src="/logo192.png"
//                 alt="Logo"
//                 sx={{ width: 40, height: 40, mr: 1, borderRadius: 1, objectFit: "cover" }}
//               />
//               <Typography variant="h6" noWrap>My Shop</Typography>
//             </Box>

//             {/* Desktop nav */}
//             {isMdUp ? (
//               <>
//                 <Box sx={{ ml: 3 }}>{NavButtons}</Box>
//                 {AuthButtons}
//               </>
//             ) : (
//               // Mobile: hamburger + right auth (login/profile can be moved into drawer if thích)
//               <>
//                 <Box sx={{ ml: "auto" }}>{AuthButtons}</Box>
//                 <IconButton
//                   color="inherit"
//                   edge="end"
//                   sx={{ ml: 1 }}
//                   onClick={toggleDrawer(true)}
//                   aria-label="open navigation"
//                 >
//                   <MenuIcon />
//                 </IconButton>
//               </>
//             )}
//           </Toolbar>
//         </Container>
//       </AppBar>

//       {/* Drawer for mobile */}
//       <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
//         <Box sx={{ width: 280, display: "flex", flexDirection: "column", height: "100%" }} role="presentation">
//           <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 1 }}>
//             <IconButton onClick={toggleDrawer(false)} aria-label="close">
//               <CloseIcon />
//             </IconButton>
//             <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Menu</Typography>
//           </Box>
//           <Divider />
//           <List sx={{ p: 1 }}>
//             {navItems.map((item) => {
//               const isActive = activePath.startsWith(item.to);
//               return (
//                 <ListItemButton
//                   key={item.to}
//                   component={NavLink}
//                   to={item.to}
//                   onClick={toggleDrawer(false)}
//                   selected={isActive}
//                   sx={{
//                     borderRadius: 1,
//                     "&.Mui-selected": {
//                       bgcolor: "action.selected",
//                     },
//                   }}
//                 >
//                   <ListItemText primary={item.label} />
//                 </ListItemButton>
//               );
//             })}
//           </List>
//           <Box sx={{ mt: "auto", p: 2 }}>
//             {!user ? (
//               <Button
//                 fullWidth
//                 variant="contained"
//                 component={Link}
//                 to="/login"
//                 onClick={toggleDrawer(false)}
//                 sx={{ textTransform: "none" }}
//               >
//                 Đăng nhập
//               </Button>
//             ) : (
//               <Button
//                 fullWidth
//                 variant="outlined"
//                 component={Link}
//                 to="/profile"
//                 onClick={toggleDrawer(false)}
//                 sx={{ textTransform: "none" }}
//               >
//                 Chào {user.username}!
//               </Button>
//             )}
//           </Box>
//         </Box>
//       </Drawer>

//       {/* Toolbar spacer to offset fixed AppBar */}
//       <Toolbar />

//       {/* Main */}
//       <Box component="main" sx={{ flex: 1, py: 3 }}>
//         <Container maxWidth="lg">
//           <Outlet context={{ user }} />
//         </Container>
//       </Box>

//       {/* Footer (bạn có thể giữ CustomerFooter cũ) */}
//       <Box component="footer" sx={{ bgcolor: "grey.100", py: 3 }}>
//         <Container maxWidth="lg">
//           {/* <CustomerFooter /> hoặc nội dung footer của bạn */}
//         </Container>
//       </Box>
//     </Box>
//   );
// }
