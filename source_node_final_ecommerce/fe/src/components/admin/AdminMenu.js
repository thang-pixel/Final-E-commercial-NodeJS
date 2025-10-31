import {
    ContainerOutlined,
    CustomerServiceOutlined,
    LogoutOutlined,
    NotificationOutlined,
    OrderedListOutlined,
    PieChartOutlined,
    ProductOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd'; 
import { Link } from 'react-router-dom';

const items = [
    {
        key: '1',
        icon: <PieChartOutlined />,
        label: <Link to="/admin/home">Trang chủ</Link>,
    },
    {
        key: '2',
        icon: <ProductOutlined />,
        label: <Link to="/admin/products">Sản phẩm</Link>,
        children: [
            {
                key: '2-1',
                label: <Link to="/admin/products">Sản phẩm</Link>, 
                children: [
                    {
                        key: '2-1-1',
                        label: <Link to="/admin/products">Danh sách sản phẩm</Link>,
                    },
                    {
                        key: '2-1-2',
                        label: <Link to="/admin/products/add">Thêm sản phẩm</Link>,
                    },
                    {
                        key: '2-1-3',
                        label: <Link to="/admin/products/edit">Sửa sản phẩm</Link>,
                    },
                    {
                        key: '2-1-4',
                        label: <Link to="/admin/products/:slug">Chi tiết sản phẩm</Link>,
                    },
                ],
            },
            {
                key: '2-2',
                label: <Link to="/admin/brands">Thương hiệu</Link>,
                children: [
                    {
                        key: '2-2-1',
                        label: <Link to="/admin/brands">Danh sách thương hiệu</Link>,
                    },
                    {
                        key: '2-2-2',
                        label: <Link to="/admin/brands/add">Thêm thương hiệu</Link>,
                    }, 
                ],
            },
            {
                key: '2-3',
                label: <Link to="/admin/categories">Danh mục</Link>, 
                children: [
                    {
                        key: '2-3-1',
                        label: <Link to="/admin/categories">Danh sách danh mục</Link>,
                    }, 
                    {
                        key: '2-3-2',
                        label: <Link to="/admin/categories/add">Thêm danh mục</Link>,
                    },  
                ],
            },
        ],
    },
    {
        key: '3',
        icon: <OrderedListOutlined />,
        label: <Link to="/admin/orders">Đơn hàng</Link>,
    },
    {
        key: '4',
        icon: <CustomerServiceOutlined />,
        label: <Link to="/admin/customers">Khách hàng</Link>, 
    },
    {
        key: '5',
        icon: <ContainerOutlined />,
        label: <Link to="/admin/promotions">Khuyến mãi</Link>,
    },
    {
        key: '6',
        icon: <ContainerOutlined />,
        label: <Link to="/admin/reports">Báo cáo, phân tích</Link>,
    }, 
    {
        key: '7',
        icon: <NotificationOutlined />,
        label: <Link to="/admin/notifications">Thông báo</Link>,
    },
    {
        key: '8',
        icon: <SettingOutlined />,
        label: <Link to="/admin/settings">Cài đặt</Link>,
    },
    { key: '9', icon: <LogoutOutlined />, label: <Link to="/logout">Đăng xuất</Link> },
];

// const flattenItemsToMap = (list, map = new Map()) => {
//     for (const it of list) {
//         if (it.path) map.set(it.key, it.path);
//         if (it.children) flattenItemsToMap(it.children, map);
//     }
//     return map;
// };

const AdminMenu = ({ collapsed, className }) => {
    // const navigate = useNavigate();
    // const location = useLocation();

    // const keyPathMap = useMemo(() => flattenItemsToMap(items), []);
    // const selectedKey = useMemo(() => {
    //     // chọn key khớp với URL hiện tại (ưu tiên path dài nhất)
    //     let match = null;
    //     for (const [k, p] of keyPathMap.entries()) {
    //         if (p === '/admin/products/:slug') continue; // không điều hướng literal
    //         if (
    //             location.pathname === p ||
    //             location.pathname.startsWith(p + '/')
    //         ) {
    //             if (!match || p.length > keyPathMap.get(match).length)
    //                 match = k;
    //         }
    //     }
    //     return match ? [match] : [];
    // }, [location.pathname, keyPathMap]);

    // const onSelect = ({ key }) => {
    //     const path = keyPathMap.get(key);
    //     if (!path) return;
    //     if (path.includes(':')) return; // chặn route động trong menu
    //     navigate(path);
    // };

    return (
        <>
        <Menu
                    mode="inline"
                    theme="light"
                    defaultSelectedKeys={['1']}
                    // onSelect={onSelect}
                    // selectedKeys={selectedKey} // 🔥 controlled theo URL
                    inlineCollapsed={collapsed}
                    items={items}
                    style={{ background: 'inherit', width: '100' }}
                    className={className}
                />
            {/* <ConfigProvider
                theme={{
                    token: {
                        itemHoverBg: '#FFEDD5',
                        itemHoverColor: '#FB923C',
                        itemSelectedBg: '#FEE2E2',
                        itemSelectedColor: '#DC2626',
                        darkItemHoverBg: '#374151',
                        darkItemHoverColor: '#F97316',
                        darkItemSelectedBg: '#1F2937',
                        darkItemSelectedColor: '#F97316',
                    },
                }}
            >
                
            </ConfigProvider> */}
        </>
    );
};

export { items as adminMenuItems };
export default AdminMenu;
