import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState, useRef, use } from 'react';
import clsx from 'clsx';
import './CustomerLayout.css';
import CustomerFooter from '../../components/customer/CustomerFooter';
import { ACTIVE_PAGES } from '../../constants/pageContants';
import SearchHome from '../../components/customer/SearchHome';
// import CategoryDrawer from '../../pages/customer/Category/CategoryDrawer';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person,
  ListAltOutlined as ListAlt,
  ShoppingCartOutlined as CartIcon,
  Close,
  AccountCircle,
  ArrowDropUpOutlined,
  ArrowDropDownOutlined,
  FavoriteOutlined as Favorite,
  Logout,
  Login,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCategory } from '../../redux/reducers/categorySlice';
import { Badge, Typography } from '@mui/material';
import useCart from '../../hooks/cartHook';
import CartDrawer from '../../components/customer/CartDrawer';
import CategoryDrawer from '../../components/customer/CategoryDrawer';

const menuPages = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const menuBottom = [
  { name: 'Trang chủ', path: '/', icon: <HomeIcon /> },
  { name: 'Yêu thích', path: '/account/favorites', icon: <Favorite /> },
  { name: 'Tài khoản', path: '/account/profile', icon: <AccountCircle /> },
  // { name: 'Giỏ hàng', path: '/account/carts', icon: <ShoppingCart /> },
  { name: 'Đơn hàng', path: '/account/orders', icon: <ListAlt /> },
];
function CustomerLayout(props) {
  const { user } = props;
  const { carts, length, totalItems } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(true);
  const { categories, loading: cateLoading } = useSelector(
    (state) => state.categories
  );
  const dispatch = useDispatch();
  // const [categories, setCategories] = useState(null)

  // load cate
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(getAllCategory());
      // setIsOpen();
    }
  }, [dispatch, categories]);

  useEffect(() => {
    console.log('Categories in Layout:', categories);
  }, [categories]);

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

  // Đóng menu profile khi click ra ngoài
  const profileMenuRef = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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

  const cateMenuRef = useRef();
  const [isOpenCateMenu, setIsOpenCateMenu] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (cateMenuRef.current && !cateMenuRef.current.contains(event.target)) {
        setIsOpenCateMenu(false);
      }
    }
    if (isOpenCateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenCateMenu]);

  const [isOpenDrawerCate, setIsOpenDrawerCate] = useState(false);
  const drawerCateRef = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerCateRef.current &&
        !drawerCateRef.current.contains(event.target)
      ) {
        setIsOpenDrawerCate(false);
      }
    }
    if (isOpenDrawerCate) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenDrawerCate]);

  const [isOpenDrawerCart, setIsOpenDrawerCart] = useState(false);
  const drawerCartRef = useRef();
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        drawerCartRef.current &&
        !drawerCartRef.current.contains(event.target)
      ) {
        setIsOpenDrawerCart(false);
      }
    }
    if (isOpenDrawerCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenDrawerCart]);

  return (
    <div className="layout-customer flex flex-col items-stretch min-h-screen">
      <header className="layout-customer__header fixed w-full bg-cyan-400 h-16 z-10 ">
        <div className="layout-customer__nav container bg-inherit py-2 h-full w-full relative mx-auto hidden md:flex justify-between items-center gap-x-4 shadow-cyan-300">
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
                  <p className="p-2 whitespace-nowrap">My Shop</p>
                </div>
              </div>
            </Link>
          </div>
          <nav className="layout-customer__nav--menu flex flex-row gap-x-2  items-center w-full">
            <div className="nav-item--search m-auto">
              <SearchHome isHomePage={true} />
            </div>

            <div
              className="nav-item--cart cursor-pointer mr-2"
              onClick={() => setIsOpenDrawerCart(true)}
            >
              <Badge color="error" badgeContent={length}>
                <CartIcon />
              </Badge>
            </div>

            <div className={'nav-item--account relative'} ref={profileMenuRef}>
              <div
                onClick={() => setShowProfileMenu((v) => !v)}
                style={{ cursor: 'pointer', position: 'relative' }}
                className="flex justify-center items-center gap-2 group"
              >
                <AccountCircle />
                <p className="p-1 font-semibold">{`Chào ${
                  user?.username || user?.full_name || user?.email || 'Khách'
                }`}</p>
                <span
                  className={`arrow-down ${showProfileMenu ? 'open' : ''}`}
                ></span>
              </div>
              <div
                className={`menuProfile-modern absolute right-0 top-full mt-2 min-w-[180px] z-20 transition-all duration-300 ${
                  showProfileMenu
                    ? 'visible opacity-100 scale-100'
                    : 'invisible opacity-0 scale-95'
                }`}
              >
                <ul className="py-2">
                  {user && (
                    <li
                      className="menuProfile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Link to={'/account/profile'}>
                        <Person className="mr-2" /> Tài khoản của tôi
                      </Link>
                    </li>
                  )}
                  {user && (
                    <li
                      className="menuProfile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Link to={'/account/orders'}>
                        <ListAlt className="mr-2" /> Đơn hàng của tôi
                      </Link>
                    </li>
                  )}
                  {user && (
                    <li
                      className="menuProfile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Link to={'/account/carts'}>
                        <CartIcon className="mr-2" /> {length} Giỏ hàng của tôi
                      </Link>
                    </li>
                  )}
                  {user && (
                    <li
                      className="menuProfile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Link to={'/logout'}>
                        <Logout className="mr-2" /> Đăng xuất
                      </Link>
                    </li>
                  )}
                  {!user && (
                    <li
                      className="menuProfile-item"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Link to={'/login'}>
                        <Login className="mr-2" /> Đăng nhập
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </nav>
          <div className="layout-customer__nav--hamburger mr-2">
            <MenuIcon
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

        {/* Danhj muc va pages */}
        <div className="layout-customer__nav container mx-auto  hidden md:flex md:items-center w-full">
          <div
            ref={cateMenuRef}
            className="relative bg-orange-400 min-w-48 rounded-lg shadow-md flex items-center mr-4"
          >
            <div
              className="flex justify-between items-center gap-2 cursor-pointer px-2 "
              onClick={() => setIsOpenCateMenu(!isOpenCateMenu)}
            >
              <div>
                <p className="py-2">Danh mục sản phẩm</p>
              </div>
              <div>
                {isOpenCateMenu ? (
                  <ArrowDropDownOutlined />
                ) : (
                  <ArrowDropUpOutlined />
                )}
              </div>
            </div>
            <div className="menuCategoryContainer absolute left-0 top-full rounded-lg z-20">
              <ul
                className={`menuCategoryList  bg-white mt-1 transition-all duration-300 rounded-md ease-in-out ${
                  isOpenCateMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                {cateLoading && <p>Loading...</p>}
                {!cateLoading && categories && categories.length > 0 ? (
                  categories.map((cate) => (
                    <li
                      key={cate._id}
                      className="menuCategoryItem hover:bg-cyan-100  rounded-e-md p-2"
                    >
                      <Link to={`/products/category_id=${cate._id}`}>
                        <div className="flex items-center px-1 gap-2">
                          <img
                            src={cate.image_url || '/category-default.png'}
                            alt={cate.name}
                            className="h-6 w-6 flex-shrink-0 mr-2 object-contain"
                          />
                          <Typography className="whitespace-nowrap">
                            {cate.name}
                          </Typography>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <Typography>Không có danh mục nào</Typography>
                )}
              </ul>
            </div>
          </div>

          <div className="flex mr-auto gap-x-4">
            {menuPages.map((page) => (
              <div
                key={page.name}
                className={
                  navItemClasses +
                  (activePage === page.name ? activeNavItemClasses : '')
                }
                onClick={() => handleActivePage(page.name)}
              >
                <Link
                  to={page.path}
                  className="flex justify-center items-center"
                >
                  <p className="p-2">{page.name}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Khi man hinh nho thi hien thi toggle categories, logo, cart button */}
        <div className="layout-customer__nav--toggle-categories md:hidden flex justify-between items-center px-4">
          <MenuIcon
            className="cursor-pointer"
            onClick={() => setIsOpenDrawerCate(!isOpenDrawerCate)}
          />

          {/* Shop name */}
          <div className="logo rounded-lg ">
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
                  <p className="p-2 whitespace-nowrap">My Shop</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="cart" onClick={() => setIsOpenDrawerCart(true)}>
            <Badge color="error" badgeContent={length}>
              <CartIcon />
            </Badge>
          </div>
        </div>

        {/* Drawer categories */}
        <div className="category-drawer">
          <CategoryDrawer
            categories={categories}
            isOpen={isOpenDrawerCate}
            setIsOpen={setIsOpenDrawerCate}
            ref={drawerCateRef}
          />
        </div>

        {/* bottom navbar */}
        <div className="fixed bottom-0 left-0 w-full bg-gray-300 md:hidden flex justify-center items-center">
          <div className="flex w-full justify-around">
            {menuBottom.map((page) => (
              <div
                key={page.name}
                className={
                  'hover:bg-white/20 hover:font-semibold hover:border-white flex flex-col justify-center items-center rounded-full p-2 '
                }
              >
                <Link
                  to={page.path}
                  className="flex justify-center items-center flex-col"
                >
                  {page.icon}
                  <p className="text-sm">{page.name}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Drawer cart */}
        <div>
          {/* Caanf ref, state open, handleOpen */}
          <CartDrawer
            ref={drawerCartRef}
            isOpen={isOpenDrawerCart}
            setIsOpen={setIsOpenDrawerCart}
          />
        </div>
      </header>

      <main className="layout-customer__main container mx-auto h-auto  relative">
        <Outlet context={{ props }} />
      </main>

      <footer className="layout-customer__footer  bg-gray-200">
        <CustomerFooter />
      </footer>
    </div>
  );
}

export default CustomerLayout;
