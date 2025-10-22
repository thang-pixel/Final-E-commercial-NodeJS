import { Link, Outlet, useLocation } from 'react-router-dom';
import './AdminLayout.css';
import AdminFooter from '../../components/admin/AdminFooter';
import AdminMenu, { adminMenuItems } from '../../components/admin/AdminMenu';
import { DownOutlined, LeftCircleOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { LightMode, NotificationsNone, Person } from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import { Dropdown, message, Space } from 'antd';

function AdminLayout(props) {
    const { user } = props;
    const location = useLocation();

    // console.log(findTitle(adminMenuList, currentPath));

    // const [title, setTitle] = useState(findTitle(adminMenuList, currentPath) || 'Dashboard');
    const title = useMemo(() => {
        const findTitle = (routes, path) => {
            for (const item of routes) {
                if (path === item.path) {
                    return item.label;
                }
                if (item.children) {
                    const found = findTitle(item.children, path);
                    if (found) return found;
                }
            }
            return null;
        };
        return findTitle(adminMenuItems, location.pathname) || 'Dashboard';
    }, [location.pathname]);

    const [collapsed, setCollapsed] = useState(false);
    const [logoHidden, setLogoHidden] = useState(false);
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        setLogoHidden(!logoHidden);
    };

    // user menu actions
    const handleUserMenuClick = ({ key }) => {
        message.info(`Click on item ${key}`);
    };
    const userMenuItems = [
        {
            key: '1',
            label: 'Hồ sơ của tôi',
        },
        {
            key: '2',
            label: 'Đăng xuất',
        },
    ];

    const textHoverClass = 'hover:text-orange-400 transition-all duration-300';
    const configClassName = (isMenu = false) => {
        let classNameTextAndBg = clsx(
            'text-black dark:text-white',
            'bg-white dark:bg-gray-800'
        );
        if (!isMenu) {
            return classNameTextAndBg;
        }
        return clsx(classNameTextAndBg, textHoverClass);
    };
    const flexClass = clsx('flex justify-center items-center gap-2');
    const classHeaderIcon = clsx(
        'w-9 h-9 rounded-xl bg-stone-200 p-2  cursor-pointer hover:bg-stone-400 transition-all',
        flexClass,
        textHoverClass
    );

    return (
        <div className="layout-admin flex min-h-screen">
            <nav
                className={`layout-admin__nav transition-all duration-300 shadow-lg 
                    ${configClassName(false)} `}
            >
                <header className="layout-admin__header flex flex-row justify-between items-center relative">
                    <div className="p-2">
                        <Link
                            to="/admin/home"
                            className={`layout-admin__logo ${
                                logoHidden ? 'hidden' : ''
                            } flex flex-row justify-start items-center gap-2`}
                        >
                            <img
                                src="/logo192.png"
                                alt="Logo"
                                className="layout-admin__logo-image w-8 h-8"
                            />
                            <span className="layout-admin__logo-text text-lg font-bold">
                                Quản trị viên
                            </span>
                        </Link>
                    </div>
                    <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-lg bg-stone-200 p-1 cursor-pointer hover:bg-stone-400 transition-all"
                        onClick={toggleCollapsed}
                    >
                        <LeftCircleOutlined rotate={collapsed ? 180 : 0} />
                    </div>
                </header>
                <div className="layout-admin__menu w-full text-inherit hover:text-orange-400">
                    <AdminMenu collapsed={collapsed} className={''} />
                </div>
            </nav>

            <div className="layout-admin__content flex flex-col flex-1 ">
                <div
                    className={`layout-admin__content-header shadow-lg ${configClassName(
                        false
                    )}
                    p-4 flex justify-center items-center gap-2
                    `}
                >
                    <h2 className="layout-admin__content-title ml-4 text-2xl font-semibold mr-auto">
                        {title}
                    </h2>

                    <div className={classHeaderIcon}>
                        <LightMode />
                    </div>
                    <div className={classHeaderIcon}>
                        <Badge
                            badgeContent={4}
                            color="error"
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <NotificationsNone />
                        </Badge>
                    </div>
                    <div
                        className={`layout-admin__content-user cursor-pointer ${textHoverClass} ${flexClass}`}
                    >
                        <Dropdown
                            menu={{
                                items: userMenuItems,
                                onClick: handleUserMenuClick,
                            }}
                        >
                            <a
                                href="profile"
                                onClick={(e) => e.preventDefault()}
                            >
                                <Space>
                                    <Person />
                                    <span>
                                        {user?.username || 'Admin'}
                                    </span>
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </div>
                <main className="layout-admin__main">
                    <div
                        className="layout-admin__content-body p-4 bg-slate-200"
                        style={{
                            minHeight: '100vh',
                        }}
                    >
                        <Outlet context={{ props }} />
                    </div>
                </main>

                <footer className="layout-admin__footer">
                    <AdminFooter />
                </footer>
            </div>
        </div>
    );
}

export default AdminLayout;
