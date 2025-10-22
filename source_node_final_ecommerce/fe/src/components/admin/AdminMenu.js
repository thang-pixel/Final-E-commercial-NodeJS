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
import { ConfigProvider, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const items = [
    {
        key: '1',
        icon: <PieChartOutlined />,
        label: 'Trang chủ',
        path: '/admin/home',
    },
    {
        key: '2',
        icon: <ProductOutlined />,
        label: 'Sản phẩm',
        children: [
            {
                key: '2-1',
                label: 'Thương hiệu',
                path: '/admin/brands',
                children: [
                    {
                        key: '2-1-1',
                        label: 'Thêm thương hiệu',
                        path: '/admin/brands/add',
                    },
                    {
                        key: '2-1-2',
                        label: 'Sửa thương hiệu',
                        path: '/admin/brands/edit',
                    },
                    {
                        key: '2-1-3',
                        label: 'Danh sách thương hiệu',
                        path: '/admin/brands',
                    },
                ],
            },
            {
                key: '2-2',
                label: 'Danh mục',
                path: '/admin/categories',
                children: [
                    {
                        key: '2-2-1',
                        label: 'Thêm danh mục',
                        path: '/admin/categories/add',
                    },
                    {
                        key: '2-2-2',
                        label: 'Sửa danh mục',
                        path: '/admin/categories/edit',
                    },
                    {
                        key: '2-2-3',
                        label: 'Danh sách danh mục',
                        path: '/admin/categories',
                    },
                ],
            },
            {
                key: '2-3',
                label: 'Sản phẩm',
                path: '/admin/products',
                children: [
                    { key: '2-3-1', label: 'Thêm sản phẩm' },
                    { key: '2-3-2', label: 'Sửa sản phẩm' },
                    { key: '2-3-3', label: 'Danh sách sản phẩm' },
                    { key: '2-3-4', label: 'Chi tiết sản phẩm' },
                ],
            },
        ],
    },
    {
        key: '3',
        icon: <OrderedListOutlined />,
        label: 'Đơn hàng',
        path: '/admin/orders',
    },
    {
        key: '4',
        icon: <CustomerServiceOutlined />,
        label: 'Khách hàng',
        path: '/admin/customers',
    },
    {
        key: '5',
        icon: <ContainerOutlined />,
        label: 'Khuyến mãi',
        path: '/admin/promotions',
    },
    {
        key: '6',
        icon: <ContainerOutlined />,
        label: 'Báo cáo, phân tích',
        path: '/admin/reports',
    },
    {
        key: '7',
        icon: <NotificationOutlined />,
        label: 'Thông báo',
        path: '/admin/notifications',
    },
    {
        key: '8',
        icon: <SettingOutlined />,
        label: 'Cài đặt',
        path: '/admin/settings',
    },
    { key: '9', icon: <LogoutOutlined />, label: 'Đăng xuất', path: '/logout' },
];


const AdminMenu = ({ collapsed, className }) => {
    const navigate = useNavigate();

    const onClickMenu = (info) => {
        const { key } = info;  

        const findMenu = (list, k) => {
            for (const item of list) {
                if (item.key === k) return item;
                if (item.children) {
                    const found = findMenu(item.children, k);
                    if (found) return found;
                }
            }
            return null;
        };

        const selectedMenu = findMenu(items, key);
        if (selectedMenu && selectedMenu.path) {
            console.log('click menu: ', selectedMenu);
            if (selectedMenu.path) {
                navigate(selectedMenu.path);
            }
        }
    };

    return (
        <>
            <ConfigProvider
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
                <Menu
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    theme="light"
                    onClick={onClickMenu}
                    inlineCollapsed={collapsed}
                    items={items}
                    style={{ background: 'inherit', width: '100' }}
                    className={className}
                />
            </ConfigProvider>
        </>
    );
};

export { items as adminMenuItems };
export default AdminMenu;
