import { Card, Select, Input, Button, Col, Row, Typography } from 'antd';

const { Option } = Select;

const TechnicalSpecs = ({ specs, setSpecs, showError }) => {
  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const updateSpec = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const removeSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const specOptions = [
    'RAM',
    'CPU',
    'Storage',
    'Screen',
    'Battery',
    'Camera',
    'OS',
    'Weight',
  ];

  return (
    <Card title="Thông số kỹ thuật" style={{ marginBottom: 20 }}>
      {specs.map((spec, i) => (
        <Row key={i} gutter={[8, 8]} align="middle" style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Chọn thông số"
              value={spec.key}
              onChange={(v) => updateSpec(i, 'key', v)}
              style={{ width: '100%' }}
            >
              {specOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Giá trị"
              value={spec.value}
              onChange={(e) => updateSpec(i, 'value', e.target.value)}
            />
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Button
              danger
              onClick={() => removeSpec(i)}
              style={{ width: '100%' }}
            >
              Xoá
            </Button>
          </Col>
        </Row>
      ))}

      <Button type="dashed" onClick={addSpec} block>
        + Thêm thông số
      </Button>

      {/* ⚠️ Hiển thị lỗi tổng thể nếu không có thông số nào */}
      {showError && specs.length === 0 && (
        <Typography.Text
          type="danger"
          style={{ display: 'block', marginTop: 8 }}
        >
          Cần nhập ít nhất 1 thông số kỹ thuật
        </Typography.Text>
      )}
    </Card>
  );
};

export default TechnicalSpecs;
