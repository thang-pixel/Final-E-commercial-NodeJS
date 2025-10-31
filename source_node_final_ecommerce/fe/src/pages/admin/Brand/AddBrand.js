import { Container, Typography } from '@mui/material';
import {
  Card,
  Input,
  Select,
  Button,
  Row,
  Col,
  Form,
  message,
  Upload,
} from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getAll } from '../../../redux/reducers/categorySlice';
import { addBrand } from '../../../redux/reducers/brandSlice';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AddBrand = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // load categories
  const { categories } = useSelector((state) => state.categories);
  const [adding, setAdding] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    console.log('Submit payload:', values);
    setAdding(true);

    let valuesSubmit = { ...values };
    valuesSubmit.image = values.image?.[0]?.originFileObj || null;
    try {
      const result = await dispatch(addBrand(valuesSubmit)).unwrap();
      messageApi.success(result.message || 'Thêm thương hiệu thành công!');
      form.resetFields();

    } catch (error) {
      messageApi.error(error.message || 'Thêm thương hiệu thất bại!');
    } finally {
      setAdding(false);
    }
    // messageApi.success('Đã lưu sản phẩm (fake API)');
    // // await axios.post("/api/products", values);
    // form.resetFields();
  };

  // load categories for selection
  useEffect(() => {
    dispatch(getAll());
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {contextHolder}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/brands')}
        style={{ marginRight: 12 }}
      >
        Quay lại
      </Button>
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
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat._id,
                  }))}
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

          {/* logo */}
          <Row>
            <Col span={24}>
              <Form.Item
                name="image"
                label="Ảnh thương hiệu"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[
                  { required: true, message: 'Hãy chọn logo thương hiệu' },
                ]}
              >
                <Upload
                  beforeUpload={() => false}
                  listType="picture-card" // 🖼️ Hiển thị dạng ảnh nhỏ
                  maxCount={1} // ✅ Chỉ cho chọn 1 file
                  accept="image/*"
                >
                  <Button>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* ================= Trạng thái & Lưu ================= */}
          <Row gutter={[8, 8]} justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                style={{ width: '100%' }}
              >
                <Select>
                  <Select.Option value={PRODUCT_STATUS.ACTIVE.value}>
                    {PRODUCT_STATUS.ACTIVE.label}
                  </Select.Option>
                  <Select.Option value={PRODUCT_STATUS.INACTIVE.value}>
                    {PRODUCT_STATUS.INACTIVE.label}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={adding}
                style={{ width: '100%' }}
              >
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
