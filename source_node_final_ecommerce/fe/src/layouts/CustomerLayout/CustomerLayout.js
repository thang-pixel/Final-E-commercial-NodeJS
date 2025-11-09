import { Link, Outlet } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
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
<<<<<<< HEAD
    ); 
=======
    );
>>>>>>> thang

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
                            ref={profileMenuRef}
                        >
                            <div
                                onClick={() => setShowProfileMenu((v) => !v)}
                                style={{ cursor: 'pointer' }}
                                className="flex justify-center items-center"
                            >
                                <AccountCircle />
                                <p className="p-2">{`Chào ${user?.username || user?.full_name || user?.email || "Khách"}!`}</p>
                            </div>
                            {showProfileMenu && (
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
                            )}
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