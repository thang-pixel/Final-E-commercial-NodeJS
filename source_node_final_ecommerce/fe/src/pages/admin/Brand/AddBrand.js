import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, Form, message } from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';

const AddBrand = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log('Submit payload:', values);
    messageApi.success('Đã lưu sản phẩm (fake API)');
    // await axios.post("/api/products", values);
    form.resetFields();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {contextHolder}
      <Typography variant="h4" gutterBottom>
        Thêm thương hiệu
      </Typography>

      {/* ================= Thông tin cơ bản ================= */}
      <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: PRODUCT_STATUS.ACTIVE.value }}
        >
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label="Tên thương hiệu"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên thương hiệu' },
                ]}
              >
                <Input placeholder="Tên thương hiệu" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Danh mục"
                  options={[
                    { value: '1', label: 'Điện thoại' },
                    { value: '2', label: 'Laptop' },
                    { value: '3', label: 'Máy tính bảng' },
                    { value: '4', label: 'Đồng hồ thông minh' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả thương hiệu">
                <Input.TextArea rows={5} placeholder="Mô tả thương hiệu" />
              </Form.Item>
            </Col>
          </Row>

          {/* ================= Trạng thái & Lưu ================= */}
          <Row justify="space-between" align="middle">
            <Col>
              <Form.Item name="status" label="Trạng thái">
                <Select style={{ width: 200 }}>
                  <Select.Option value={PRODUCT_STATUS.ACTIVE.value}>
                    {PRODUCT_STATUS.ACTIVE.label}
                  </Select.Option>
                  <Select.Option value={PRODUCT_STATUS.INACTIVE.value}>
                    {PRODUCT_STATUS.INACTIVE.label}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col>
              <Button type="primary" htmlType="submit">
                Lưu thương hiệu
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default AddBrand;
