import { Card, Input, InputNumber, Button, Row, Col, Typography } from 'antd';

const buildEmptyVariant = (categoryAttributes = []) => ({
  attributes: categoryAttributes.reduce(
    (acc, attr) => ({ ...acc, [attr.code]: '' }),
    {}
  ),
  price: null,
  original_price: null,
  stock_quantity: null,
});

const AddProductVariant = ({
  variants,
  setVariants,
  showError,
  categoryAttributes = [],
}) => {
  const addVariant = () => {
    setVariants([...variants, buildEmptyVariant(categoryAttributes)]);
  };

  const updateVariantField = (index, field, value) => {
    const newList = [...variants];
    newList[index][field] =
      field === 'price' ||
      field === 'original_price' ||
      field === 'stock_quantity'
        ? value !== null
          ? Number(value)
          : null
        : value;

    // kiểm tra: giá bán không được nhỏ hơn giá gốc
    if (field === 'price' && newList[index].original_price !== null) {
      if (Number(value) < newList[index].original_price) {
        newList[index].price = null;
      }
    }

    setVariants(newList);
  };

  const updateVariantAttribute = (index, code, value) => {
    const newList = [...variants];
    newList[index].attributes = {
      ...newList[index].attributes,
      [code]: value,
    };
    setVariants(newList);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <Card title="Biến thể sản phẩm" style={{ marginBottom: 20 }}>
      {variants.map((v, i) => (
        <Row
          key={i}
          gutter={[8, 8]}
          align="middle"
          style={{ marginBottom: 12 }}
        >
          {/* variant thứ n */}
          <Col span={24}>
            <Typography.Text strong>Biến thể {i + 1}</Typography.Text>
          </Col>

          {/* 🔹 Render động các thuộc tính theo Category.attributes */}
          {categoryAttributes.map((attr) => (
            <Col xs={24} sm={12} md={4} key={attr.code}>
              {attr.label}:
              <Input
                placeholder={attr.label}
                value={v.attributes?.[attr.code] || ''}
                onChange={(e) =>
                  updateVariantAttribute(i, attr.code, e.target.value)
                }
              />
            </Col>
          ))}

          {/* Giá bán */}
          <Col xs={24} sm={12} md={4}>
            Giá bán:
            <InputNumber
              placeholder="Giá bán"
              value={v.price}
              formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value.replace(/\./g, '')}
              min={0}
              style={{ width: '100%' }}
              onChange={(value) => updateVariantField(i, 'price', value)}
            />
          </Col>

          {/* Giá gốc */}
          <Col xs={24} sm={12} md={4}>
            Giá gốc:
            <InputNumber
              placeholder="Giá gốc"
              value={v.original_price}
              style={{ width: '100%' }}
              formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value.replace(/\./g, '')}
              min={0}
              onChange={(value) =>
                updateVariantField(i, 'original_price', value)
              }
            />
          </Col>

          {/* Tồn kho */}
          <Col xs={24} sm={12} md={4}>
            Tồn kho:
            <InputNumber
              placeholder="Tồn kho"
              value={v.stock_quantity}
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value.replace(/\./g, '')}
              onChange={(value) => {
                updateVariantField(i, 'stock_quantity', value);
              }}
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

      {showError && variants.length === 0 && (
        <Typography.Text
          type="danger"
          style={{ display: 'block', marginTop: 8 }}
        >
          Cần nhập ít nhất 2 biến thể sản phẩm
        </Typography.Text>
      )}
    </Card>
  );
};

export default AddProductVariant;
