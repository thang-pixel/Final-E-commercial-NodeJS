import { Card, Input, InputNumber, Button, Row, Col, Typography } from 'antd';

const AddProductVariant = ({ variants, setVariants }) => {
    const addVariant = () => {
        setVariants([
            ...variants,
            { color: '', storage: '', price: 0, stock_quantity: 0 },
        ]);
    };

    const updateVariant = (index, field, value) => {
        const newList = [...variants];
        newList[index][field] = value;
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
                        <Typography.Text strong>
                            Biến thể {i + 1}
                        </Typography.Text>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Màu"
                            value={v.color}
                            onChange={(e) =>
                                updateVariant(i, 'color', e.target.value)
                            }
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Dung lượng"
                            value={v.storage}
                            onChange={(e) =>
                                updateVariant(i, 'storage', e.target.value)
                            }
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <InputNumber
                            placeholder="Giá"
                            value={v.price}
                            style={{ width: '100%' }}
                            onChange={(value) =>
                                updateVariant(i, 'price', value)
                            }
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <InputNumber
                            placeholder="Tồn kho"
                            value={v.stock_quantity}
                            style={{ width: '100%' }}
                            onChange={(value) =>
                                updateVariant(i, 'stock_quantity', value)
                            }
                        />
                    </Col>
                    <Col xs={24} sm={24} md={4}>
                        <Button danger block onClick={() => removeVariant(i)}>
                            Xóa
                        </Button>
                    </Col>
                </Row>
            ))}
            <Button type="dashed" onClick={addVariant} block style={{ marginTop: 10 }}>
                + Thêm biến thể
            </Button>
        </Card>
    );
};

export default AddProductVariant;
