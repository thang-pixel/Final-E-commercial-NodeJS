import { Card, Input, InputNumber, Button, Row, Col, Typography } from 'antd';

const AddProductVariant = ({ variants, setVariants, showError }) => {
  const addVariant = () => {
    setVariants([
      ...variants,
      { color: '', storage: '', price: null, original_price: null, stock_quantity: null },
    ]);
  };

  const updateVariant = (index, field, value) => {
    const newList = [...variants];
    newList[index][field] = value;
    if (field === 'price' || field === 'original_price' || field === 'stock_quantity') {
      newList[index][field] = value !== null ? Number(value) : null;
    }
    // kiem tra giá bán không được lớn hơn giá gốc
    if (field === 'price' && newList[index]['original_price'] !== null) {
      if (Number(value) > newList[index]['original_price']) {
        newList[index]['price'] = null;
      }
    }
    setVariants(newList);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <Card title="Biến thể sản phẩm" style={{ marginBottom: 20 }}>
      {variants.map((v, i) => (
        <Row key={i} gutter={[8, 8]} align="middle">
          {/* variant thứ n */}
          <Col span={24}>
            <Typography.Text strong>Biến thể {i + 1}</Typography.Text>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Màu"
              value={v.color}
              onChange={(e) => updateVariant(i, 'color', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Dung lượng"
              value={v.storage}
              onChange={(e) => updateVariant(i, 'storage', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <InputNumber
              placeholder="Giá bán"
              value={v.price}
              style={{ width: '100%' }}
              onChange={(value) => updateVariant(i, 'price', value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <InputNumber
              placeholder="Giá gốc"
              value={v.original_price}
              style={{ width: '100%' }}
              onChange={(value) => updateVariant(i, 'original_price', value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <InputNumber
              placeholder="Tồn kho"
              value={v.stock_quantity}
              style={{ width: '100%' }}
              onChange={(value) => updateVariant(i, 'stock_quantity', value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button danger block onClick={() => removeVariant(i)}>
              Xóa
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        type="dashed"
        onClick={addVariant}
        block
        style={{ marginTop: 10 }}
      >
        + Thêm biến thể
      </Button>

      {/* ⚠️ Hiển thị lỗi tổng thể nếu không có thông số nào */}
      {showError && variants.length === 0 && (
        <Typography.Text type="danger" style={{ display: 'block', marginTop: 8 }}>
          Cần nhập ít nhất 3 biến thể sản phẩm
        </Typography.Text>
      )}
    </Card>
  );
};

export default AddProductVariant;
