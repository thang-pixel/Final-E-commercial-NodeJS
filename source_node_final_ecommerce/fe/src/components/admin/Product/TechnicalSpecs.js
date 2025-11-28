import { Card, AutoComplete, Input, Button, Col, Row, Typography } from 'antd';

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

  // AutoComplete cần dạng { value: string }
  const autoCompleteOptions = specOptions.map((opt) => ({ value: opt }));

  return (
    <Card title="Thông số kỹ thuật" style={{ marginBottom: 20 }}>
      {specs.map((spec, i) => (
        <Row key={i} gutter={[8, 8]} align="middle" style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12} md={8}>
            <AutoComplete
              placeholder="Chọn hoặc nhập thông số"
              value={spec.key}
              options={autoCompleteOptions}
              onChange={(v) => updateSpec(i, 'key', v)} // gõ tay hoặc chọn đều chạy vào đây
              style={{ width: '100%' }}
              allowClear
              filterOption={(inputValue, option) =>
                option.value
                  .toUpperCase()
                  .includes(inputValue.toUpperCase())
              }
            />
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
