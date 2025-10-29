import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, Form, message } from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { useState } from 'react';

const AddCategory = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true); // ✅ bật loading
      console.log('Submit payload:', values);

      // fake API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // await axios.post("/api/products", values);
      messageApi.success('Đã lưu thương hiệu thành công!');
      form.resetFields();
    } catch (error) {
      messageApi.error('Lưu thất bại!');
    } finally {
      setLoading(false); // ✅ tắt loading dù thành công hay lỗi
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {contextHolder}
      <Typography variant="h4" gutterBottom>
        Thêm danh mục
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên danh mục' },
                ]}
              >
                <Input placeholder="Nhập tên danh mục" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="category_id"
                label="Danh mục cha"
                // rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Chọn danh mục cha"
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
              <Form.Item
                name="description"
                label="Nhập mô tả thương hiệu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả danh mục' },
                ]}
              >
                <Input.TextArea rows={5} placeholder="Nhập mô tả thương hiệu" />
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thương hiệu
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default AddCategory;
