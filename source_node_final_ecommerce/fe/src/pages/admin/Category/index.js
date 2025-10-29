// src/pages/admin/Product/index.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Segmented,
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

const STATUS = [
  { label: 'Đang hoạt động', value: 'ACTIVE', color: 'green' },
  { label: 'Ẩn', value: 'INACTIVE', color: 'default' },
];

// TODO: Thay bằng API thật
async function mockFetch(params) {
  const total = 42;
  const items = Array.from({ length: params.pageSize }, (_, i) => {
    const id = (params.page - 1) * params.pageSize + i + 1;
    return {
      _id: String(id),
      name: `Sản phẩm ${id}`,
      parentCategory: `Danh mục cha ${((id - 1) % 5) + 1}`,
      description: `Mô tả cho danh mục ${id}`,
      productCount: Math.floor(Math.random() * 100),
      status: STATUS[id % 2].value,
      createdAt: dayjs().subtract(id, 'day').toISOString(),
      cover: `https://picsum.photos/seed/p${id}/400/300`,
    };
  });
  return new Promise((r) => setTimeout(() => r({ items, total }), 250));
}

const CategoryList = () => {
  // View state
  const [view, setView] = useState('table'); // "table" | "grid"
  const [loading, setLoading] = useState(false);

  // Filters
  const [q, setQ] = useState('');
  const [category, setCategory] = useState();
  const [status, setStatus] = useState();
  const [dateRange, setDateRange] = useState();

  // Paging/Sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sorter, setSorter] = useState(); // { field, order }

  // Data
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  // Build query
  const query = useMemo(
    () => ({
      q,
      category,
      status,
      dateFrom: dateRange?.[0]?.startOf('day').toISOString(),
      dateTo: dateRange?.[1]?.endOf('day').toISOString(),
      page,
      pageSize,
      sort: sorter?.order
        ? `${sorter.field}:${sorter.order === 'ascend' ? 'asc' : 'desc'}`
        : undefined,
    }),
    [q, category, status, dateRange, page, pageSize, sorter]
  );

  // Fetch
  const fetchData = async (override = {}) => {
    setLoading(true);
    try {
      const res = await mockFetch({ ...query, ...override });
      console.log(query);
      setData(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); /* eslint-disable-next-line */
  }, [category, status, dateRange, page, pageSize, sorter]);

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
    setCategory();
    setStatus();
    setDateRange();
    setPage(1);
    setSorter();
    fetchData({
      q: '',
      category: undefined,
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
                src={r.cover}
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
    { title: 'Danh mục cha', dataIndex: 'parentCategory', width: 140 },
    { title: 'Số sản phẩm', dataIndex: 'productCount', width: 120 },
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
      sorter: true,
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
            <Button size="small" type="primary" ghost icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button size="small" danger icon={<DeleteOutlined />} />
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
      {/* Toolbar */}
      <Typography.Title level={4}>Danh sách danh mục</Typography.Title>
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} md={10}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, mô tả..."
            value={q}
            onChange={onSearchChange}
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
            <Row gutter={[12, 12]}>
              {data.map((p) => (
                <Col defaultValue={24} xs={12} md={8} lg={6} xl={4} key={p._id}>
                  <Card
                    size="small"
                    hoverable
                    cover={
                      <img
                        src={p.cover}
                        alt={p.name}
                        style={{
                          height: 140,
                          objectFit: 'cover',
                        }}
                      />
                    }
                    actions={[
                      <EyeOutlined key="v" />,
                      <EditOutlined key="e" />,
                      <DeleteOutlined key="d" />,
                    ]}
                  >
                    <Card.Meta
                      title={<div style={{ fontWeight: 600 }}>{p.name}</div>}
                      description={
                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: '100%' }}
                        >
                          <Space>
                            <Tag
                              color={
                                STATUS.find((s) => s.value === p.status)?.color
                              }
                            >
                              {STATUS.find((s) => s.value === p.status)?.label}
                            </Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
              <Col span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= total}
                  >
                    Trang sau
                  </Button>
                </Space>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Space>
  );
};

export default CategoryList;
