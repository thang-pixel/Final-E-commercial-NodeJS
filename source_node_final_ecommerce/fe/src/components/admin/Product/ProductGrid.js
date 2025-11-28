import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Space, Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';

const ProductGrid = ({
  products,
  meta,
  page,
  pageSize,
  setPage,
  STATUS,
  onDelete,
}) => {
  console.log('Rendering ProductGrid with products:', products);
  return (
    <Row gutter={[12, 12]}>
      {products.map((p) => (
        <Col defaultValue={24} xs={12} md={8} lg={6} xl={4} key={p._id}>
          <Card
            size="small"
            hoverable
            cover={
              <img
                src={p.images?.[0]?.img_url || '/no-image.png'}
                alt={p.name}
                style={{
                  height: 140,
                  objectFit: 'contain',
                }}
              />
            }
            actions={[
              <Tooltip title="Xem">
                <Link to={`${p._id}/detail`}>
                  <Button size="small" ghost icon={<EyeOutlined />} />
                </Link>
              </Tooltip>,
              <Tooltip title="Sửa">
                <Link to={`edit/${p._id}`}>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<EditOutlined />}
                  />
                </Link>
              </Tooltip>,
              <Tooltip title="Xoá">
                <Button
                  size="small"
                  danger
                  ghost
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(p._id, p.name)}
                />
              </Tooltip>,
            ]}
          >
            <Card.Meta
              title={<div style={{ fontWeight: 600 }}>{p.name}</div>}
              description={
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space>
                    <Tag
                      color={STATUS.find((s) => s.value === p.status)?.color}
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
            disabled={page * pageSize >= (meta?.totalItems || 0)}
          >
            Trang sau
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default ProductGrid;
