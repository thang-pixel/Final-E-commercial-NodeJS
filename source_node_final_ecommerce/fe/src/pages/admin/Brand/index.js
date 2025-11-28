// src/pages/admin/Product/index.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
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
import { useDispatch, useSelector } from 'react-redux';
import { deleteBrand, getAllBrands } from '../../../redux/reducers/brandSlice';
import BrandTable from '../../../components/admin/Brand/BrandTable';
import BrandGrid from '../../../components/admin/Brand/BrandGrid';

const { RangePicker } = DatePicker;

const STATUS = [
  { label: 'Đang hoạt động', value: 'ACTIVE', color: 'green' },
  { label: 'Ẩn', value: 'INACTIVE', color: 'default' },
];

const BrandList = () => {
  // View state
  const { brands, loading, meta } = useSelector((state) => state.brands);
  const dispatch = useDispatch();
  // message api
  const [messageApi, contextHolderMessage] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();

  const [view, setView] = useState('table');
  // Filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState();
  const [dateRange, setDateRange] = useState();

  // Paging/Sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sorter, setSorter] = useState(); // { field, order }

  // Build query
  const query = useMemo(
    () => ({
      search: q,
      status,
      dateFrom: dateRange?.[0]?.startOf('day').toISOString(),
      dateTo: dateRange?.[1]?.endOf('day').toISOString(),
      page,
      limit: pageSize,
      sort: sorter?.order
        ? `${sorter.field}:${sorter.order === 'ascend' ? 'asc' : 'desc'}`
        : undefined,
    }),
    [q, status, dateRange, page, pageSize, sorter]
  );

  useEffect(() => {
    dispatch(getAllBrands(query));
  }, [dispatch, query]);

  // Search debounce
  const dRef = useRef();
  const onSearchChange = (e) => {
    const value = e.target.value;
    setQ(value);
    clearTimeout(dRef.current);
    dRef.current = setTimeout(() => {
      setPage(1);
      // fetchData({ q: value, page: 1 });
    }, 500);
  };

  const reset = () => {
    setQ('');
    setStatus();
    setDateRange();
    setPage(1);
    setSorter();
    dispatch(getAllBrands({}));
  };

  // modal delete
  const handleDeleteConfirm = (id, name) => {
    modal.confirm({
      title: 'Xác nhận xoá',
      content: `Bạn có chắc chắn muốn xoá danh mục id = ${id} (${name}) này không?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      centered: true,
      onOk: async () => {
        try {
          await dispatch(deleteBrand(id)).unwrap();
          messageApi.success('Đã xoá thương hiệu thành công!');
        } catch (error) {
          messageApi.error(error.message || 'Xoá thất bại!');
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      width: 40,
      sorter: (a, b) => a._id.localeCompare(b._id),
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'name',
      width: 120,
      sorter: (a, b) => a?.name.localeCompare(b?.name),
      render: (text, r) => (
        <>
          {view === 'table' ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              {text}
              <img
                src={r?.image_url}
                alt={r?.name}
                style={{
                  width: 32,
                  height: 32,
                  objectFit: 'contain',
                  borderRadius: 6,
                }}
              />
            </div>
          ) : (
            <Space>
              <img
                src={r?.image_url}
                alt={r?.name}
                style={{
                  width: 44,
                  height: 32,
                  objectFit: 'contain',
                  borderRadius: 6,
                }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{text}</div>
              </div>
            </Space>
          )}
        </>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      sorter: (a, b) => a.category_id - b.category_id,
      width: 160,
      render: (cate_id) => <>{cate_id?.name || '00'}</>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status) => {
        const color = status === 'INACTIVE' ? 'red' : 'green';
        const label = status === 'INACTIVE' ? 'Đã ẩn' : 'Hoạt động';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Tạo lúc',
      dataIndex: 'createdAt',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      width: 160,
      render: (v) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Thao tác',
      width: 150,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem">
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Link to={`edit/${r._id}`}>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<EditOutlined />}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteConfirm(r._id, r.name)}
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
    rowSelection: true,
    scroll: { x: '100%' },
    // tableLayout: tableLayout === 'unset' ? undefined : tableLayout,
  };

  return (
    <Space direction="vertical" style={{ display: 'block' }} size={12}>
      {contextHolderMessage}
      {contextHolderModal}
      {/* Toolbar */}
      <Row gutter={[8, 8]} justify="center" align="middle">
        <Col xs={24} md={12}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, mô tả..."
            value={q}
            onChange={onSearchChange}
          />
        </Col>
        {/* <Col xs={12} md={4}>
          <Select
            allowClear
            placeholder="Danh mục"
            value={brands}
            onChange={setCategory}
            options={[
              { label: 'Điện thoại', value: 'Điện thoại' },
              { label: 'Tai nghe', value: 'Tai nghe' },
              { label: 'Laptop', value: 'Laptop' },
              { label: 'Phụ kiện', value: 'Phụ kiện' },
            ]}
            style={{ width: '100%' }}
          />
        </Col> */}
        <Col xs={12} md={6}>
          <Select
            allowClear
            placeholder="Trạng thái"
            value={status}
            onChange={setStatus}
            options={STATUS.map((s) => ({
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
              <Link to="add">Thêm thương hiệu</Link>
            </Button>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                {
                  label: 'Bảng',
                  value: 'table',
                  icon: <TableOutlined />,
                },
                {
                  label: 'Lưới',
                  value: 'grid',
                  icon: <AppstoreOutlined />,
                },
              ]}
            />
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: '10px 0' }} />

      <Row gutter={[8, 8]} justify="center" align="middle">
        <Col span={24} style={{ textAlign: 'center' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Danh sách thương hiệu
          </Typography.Title>
        </Col>

        {/* hiển thị danh sách thương hiệu */}
        <Col span={24}>
          {/* Content */}
          {loading && brands.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
              {view === 'table' ? (
                <BrandTable
                  tableProps={tableProps}
                  loading={loading}
                  columns={columns}
                  brands={brands}
                  onTableChange={onTableChange}
                  meta={meta}
                  page={page}
                  pageSize={pageSize}
                />
              ) : (
                <BrandGrid
                  brands={brands}
                  meta={meta}
                  page={page}
                  pageSize={pageSize}
                  setPage={setPage}
                  STATUS={STATUS}
                  onDelete={handleDeleteConfirm}
                />
              )}
            </>
          )}
        </Col>
      </Row>
    </Space>
  );
};

export default BrandList;
