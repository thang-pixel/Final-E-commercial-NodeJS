// src/pages/admin/Product/index.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  TableOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import {
  changeProductStatus,
  getAllProducts,
  softDeleteProduct,
} from '../../../redux/reducers/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../../../components/admin/Product/ProductGrid';
import { getAllCategory } from '../../../redux/reducers/categorySlice';
import { getAllBrands } from '../../../redux/reducers/brandSlice';

const { RangePicker } = DatePicker;

const PRODUCT_STATUS = {
  ACTIVE: { label: 'Đang bán', value: 'ACTIVE', color: 'green' },
  INACTIVE: { label: 'Ẩn', value: 'INACTIVE', color: 'default' },
  // OUT_OF_STOCK: { label: 'Hết hàng', value: 'OUT_OF_STOCK', color: 'red' },
};
const ProductList = () => {
  const [messageApi, contextHolderMessage] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();

  const { products, meta: metaProducts } = useSelector(
    (state) => state.products
  );
  const { categories } = useSelector((state) => state.categories);
  const { brands } = useSelector((state) => state.brands);

  const dispatch = useDispatch();
  // View state
  const [view, setView] = useState('table'); // "table" | "grid"
  const [loading, setLoading] = useState(false);

  // Filters
  const [q, setQ] = useState('');
  const [category_id, setCategory_id] = useState();
  const [brand_id, setBrand_id] = useState();
  const [status, setStatus] = useState();
  const [dateRange, setDateRange] = useState();

  // Paging/Sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sorter, setSorter] = useState(); // { field, order }

  // Data
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  // Build query
  const query = useMemo(
    () => ({
      keyword: q,
      category_id,
      brand_ids: [brand_id],
      status,
      dateFrom: dateRange?.[0]?.startOf('day').toISOString(),
      dateTo: dateRange?.[1]?.endOf('day').toISOString(),
      page,
      limit: pageSize,
      sort: sorter?.order
        ? `${sorter.field}_${sorter.order === 'ascend' ? 'asc' : 'desc'}`
        : undefined,
    }),
    [q, category_id, brand_id, status, dateRange, page, pageSize, sorter]
  );

  // Fetch
  const fetchData = async (override = {}) => {
    setLoading(true);
    try {
      console.log({ ...query, ...override });
      const res = await dispatch(
        getAllProducts({ ...query, ...override })
      ).unwrap();
      console.log(res);
      setData(res.data);
      setTotal(res.data?.length > 0 ? res?.meta?.totalItems : 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); /* eslint-disable-next-line */
  }, [category_id, brand_id, status, dateRange, page, pageSize, sorter]);
  // fetch categories, brands for filters
  useEffect(() => {
    dispatch(getAllCategory());
    dispatch(getAllBrands());
  }, [dispatch]);

  // Search debounce
  const dRef = useRef();
  const onSearchChange = (e) => {
    const value = e.target.value;
    setQ(value);
    clearTimeout(dRef.current);
    dRef.current = setTimeout(() => {
      setPage(1);
      fetchData({ q: value, page: 1 });
    }, 300);
  };

  const reset = () => {
    setQ('');
    setCategory_id();
    setBrand_id();
    setStatus();
    setDateRange();
    setPage(1);
    setSorter();
    fetchData({
      q: '',
      category_id: undefined,
      brand_id: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
      sort: undefined,
    });
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      width: 50,
      sorter: (a, b) => a._id - b._id,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, r) => (
        <>
          <Space>
            <img
              src={r.images?.[0]?.img_url}
              alt={r.name}
              style={{
                width: 48,
                height: 48,
                objectFit: 'contain',
                borderRadius: 6,
              }}
            />
            <div>
              <Link to={`${r._id}/detail`}>
                <Typography.Paragraph
                  strong
                  ellipsis={{ rows: 2 }}
                  style={{ margin: 0, maxWidth: 200 }}
                >
                  {r.name}
                </Typography.Paragraph>
              </Link>
            </div>
          </Space>
        </>
      ),
    },
    {
      title: 'Giá thấp nhất',
      dataIndex: 'min_price',
      sorter: (a, b) => a.min_price - b.min_price,
      width: 150,
      align: 'right',
      render: (v) => v.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Giá cao nhất',
      dataIndex: 'max_price',
      sorter: (a, b) => a.max_price - b.max_price,
      width: 150,
      align: 'right',
      render: (v) => v.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brand_id',
      sorter: true,
      width: 150,
      render: (v) => v?.name || '',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      sorter: true,
      width: 150,
      render: (v) => v?.name || '',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (v, record ) => {
        // const s = PRODUCT_STATUS.find((x) => x.value === v);
        // select component to change status
        console.log('Render status:', v, record);
        return (
          <Select
            value={v}
            onChange={(newStatus) => handleChangeStatus(record?._id, newStatus)}
            options={Object.values(PRODUCT_STATUS).map((s) => ({
              label: s.label,
              value: s.value,
            }))}
            style={{ width: '100%' }}
          />
        );
        // return <Tag color={s?.color}>{s?.label}</Tag>;
      },
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      sorter: true,
      width: 150,
      render: (v) => dayjs(v).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      width: 150,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết và biến thể">
            <Link to={`${r._id}/detail`}>
              <Button size="small" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Sửa thông tin">
            <Link to={`edit/${r._id}`}>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<EditOutlined />}
              />
            </Link>
            {/* <Button size="small" type="primary" onClick={() => openEditPage(r._id)} ghost icon={<EditOutlined />} /> */}
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              onClick={() => handleDeleteConfirm(r._id, r.name)}
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const onTableChange = (pagination, _filters, sorterAnt) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSorter(
      sorterAnt?.order
        ? { field: sorterAnt.field, order: sorterAnt.order }
        : undefined
    );
  };

  const tableProps = {
    bordered: true,
    loading,
    size: 'middle',
    // expandable,
    // title: showTitle ? defaultTitle : undefined,
    // rowSelection: true,
    className: 'admin-product-table',
    scroll: { x: '100%' },
    // tableLayout: tableLayout === 'unset' ? undefined : tableLayout,
  };

  // modal delete
  const handleDeleteConfirm = (id, name) => {
    modal.confirm({
      title: 'Xác nhận xoá',
      content: `Bạn có chắc chắn muốn xoá sản phẩm id = ${id} (${name}) này không?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      centered: true,
      onOk: async () => {
        try {
          const result = await dispatch(
            softDeleteProduct(parseInt(id, 10))
          ).unwrap();
          messageApi.success(`Xoá thành công! ID: ${result.data}`);
          // refetch
          fetchData();
        } catch (error) {
          messageApi.error(error.message || 'Xoá thất bại!');
          console.error('Delete product error:', error);
        }
      },
    });
  };

  // change status product

  const handleChangeStatus = async (id, newStatus) => {
    console.log('Change status:', id, newStatus);
    if (!id || !newStatus) return;
    if (
      newStatus !== PRODUCT_STATUS.ACTIVE.value &&
      newStatus !== PRODUCT_STATUS.INACTIVE.value
    ) {
      messageApi.error('Trạng thái không hợp lệ!');
      return;
    }

    try {
      await dispatch(changeProductStatus({ productId:id, status: newStatus })).unwrap();
      messageApi.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      messageApi.error(error.message || 'Cập nhật trạng thái thất bại!');
      console.error('Change product status error:', error);
    }
  };

  return (
    <>
      {contextHolderMessage}
      {contextHolderModal}

      <Space direction="vertical" style={{ display: 'block' }} size={12}>
        {/* <Typography.Title level={4}>Danh sách sản phẩm</Typography.Title> */}
        {/* Toolbar */}
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} md={10}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên, SKU..."
              value={q}
              onChange={onSearchChange}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              allowClear
              placeholder="Danh mục"
              value={category_id}
              onChange={setCategory_id}
              options={categories.map((c) => ({
                label: c?.name,
                value: c?._id,
              }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              allowClear
              placeholder="Thương hiệu"
              value={brand_id}
              onChange={setBrand_id}
              options={brands.map((b) => ({ label: b?.name, value: b?._id }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={3}>
            <Select
              allowClear
              placeholder="Trạng thái"
              value={status}
              onChange={setStatus}
              options={Object.values(PRODUCT_STATUS).map((s) => ({
                label: s.label,
                value: s.value,
              }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} md="auto" style={{ marginLeft: 'auto' }}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={reset}>
                Làm mới
              </Button>
              <Button type="primary" icon={<PlusOutlined />}>
                <Link to="add">Thêm sản phẩm</Link>
              </Button>
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { label: 'Bảng', value: 'table', icon: <TableOutlined /> },
                  { label: 'Lưới', value: 'grid', icon: <AppstoreOutlined /> },
                ]}
              />
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '10px 0' }} />

        <Row gutter={[8, 8]} justify="center" align="middle">
          <Col span={24} style={{ textAlign: 'center' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Danh sách sản phẩm
            </Typography.Title>
          </Col>

          {/* hiển thị danh sách sản phẩm */}

          <Col span={24}>
            {/* Content */}
            {view === 'table' ? (
              <Table
                rowKey="_id"
                {...tableProps}
                loading={loading}
                columns={columns}
                dataSource={data}
                onChange={onTableChange}
                pagination={{
                  total,
                  current: page,
                  pageSize,
                  showSizeChanger: true,
                  showTotal: (t) => `${t} sản phẩm`,
                }}
                scroll={{ x: '100%', y: 600 }}
              />
            ) : (
              <ProductGrid
                products={data}
                page={page}
                pageSize={pageSize}
                meta={products?.meta}
                loading={loading}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(size) => setPageSize(size)}
                onDelete={handleDeleteConfirm}
                STATUS={PRODUCT_STATUS}
              />
            )}
          </Col>
        </Row>
      </Space>
    </>
  );
};

export default ProductList;
