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
import { deleteCategory, getAllCategory } from '../../../redux/reducers/categorySlice';
import { API_DOMAIN } from '../../../constants/apiDomain';
import CategoryTable from '../../../components/admin/Category/CategoryTable';
import CategoryGrid from '../../../components/admin/Category/CategoryGrid'; 
const STATUS = [
  { label: 'Đang hoạt động', value: 'ACTIVE', color: 'green' },
  { label: 'Ẩn', value: 'INACTIVE', color: 'default' },
];

const CategoryList = () => {
  // View state
  const { categories, loading, meta } = useSelector(
    (state) => state.categories
  );
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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllCategory(query));
  }, [dispatch, query]);

  // Search debounce
  const dRef = useRef();
  const onSearchChange = (e) => {
    const value = e.target.value;
    setQ(value);
    clearTimeout(dRef.current);
    dRef.current = setTimeout(() => {
      setPage(1);
    }, 500);
  };

  const reset = () => {
    setQ('');
    setStatus();
    setDateRange();
    setPage(1);
    setSorter();
    dispatch(getAllCategory({}));
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
          await dispatch(deleteCategory(id)).unwrap();
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
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 120,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, r) => (
        <>
          {view === 'table' ? (
            text
          ) : (
            <Space>
              <img
                src={API_DOMAIN + r.image}
                alt={r.name}
                style={{
                  width: 44,
                  height: 32,
                  objectFit: 'cover',
                  borderRadius: 6,
                }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{text}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{r.sku}</div>
              </div>
            </Space>
          )}
        </>
      ),
    },
    { title: 'Mô tả', dataIndex: 'description', width: 160 },
    { title: 'Danh mục cha', dataIndex: 'parent_id', width: 140 },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      width: 80,
      render: (v) => v || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (v) => {
        const s = STATUS.find((x) => x.value === v);
        return <Tag color={s?.color}>{s?.label}</Tag>;
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
      {/* <Typography.Title level={4}>Danh sách danh mục</Typography.Title> */}
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} md={12}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, mô tả..."
            value={q}
            onChange={onSearchChange}
          />
        </Col>

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
          <DatePicker.RangePicker
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
              <Link to="add">Thêm danh mục</Link>
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
            Danh sách danh mục
          </Typography.Title>
        </Col>

        {/* hiển thị danh sách danh mục */}
        <Col span={24}>
          {/* Content */}
          {loading && categories.length === 0 ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
              {view === 'table' ? (
                <CategoryTable
                  tableProps={tableProps}
                  loading={loading}
                  columns={columns}
                  categories={categories}
                  onTableChange={onTableChange}
                  meta={meta}
                  page={page}
                  pageSize={pageSize}
                />
              ) : (
                <CategoryGrid
                  categories={categories}
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

export default CategoryList;
