import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, Form, message, Spin } from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { useDispatch, useSelector } from 'react-redux';
import { 
  editCategory, 
  getAllCategory,
  getCategoryById,
} from '../../../redux/reducers/categorySlice';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const EditCategory = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const {
    loading, 
    categories,
    currentCategory,
  } = useSelector((state) => state.categories);
  const dispatch = useDispatch();
  useEffect(() => {
    // Fetch categories for parent category selection
    dispatch(getAllCategory());
  }, [dispatch]);
  useEffect(() => {
    // Fetch current category data
    if (id) {
      dispatch(getCategoryById(id));
    }
  }, [dispatch, id]);
  // const [loading, setLoading] = useState(false);
    useEffect(() => {
    if (currentCategory) {
      form.setFieldsValue({
        name: currentCategory.name,
        description: currentCategory.description,
        status: currentCategory.status,
        parent_id: currentCategory.parent_id,
      });
    }
  }, [currentCategory, form]);

  const handleSubmit = async (values) => {
    console.log('Submit payload:', values);
    
    try {
      const result = await dispatch(editCategory({ id, categoryData: values })).unwrap();
      messageApi.success(result.message || 'Cập nhật danh mục thành công!');
    } catch (err) {
      messageApi.error(err.message || 'Cập nhật danh mục thất bại!');
    }
  };

  if (loading && !currentCategory) return <Spin tip="Đang tải..." />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {contextHolder}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/categories')}
        style={{ marginRight: 12 }}
      >
        Quay lại
      </Button>
      <Typography variant="h4" gutterBottom>
        Sửa danh mục
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
                name="parent_id"
                label="Danh mục cha"
                // rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Chọn danh mục cha"
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
              <Form.Item
                name="description"
                label="Nhập mô tả danh mục"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả danh mục' },
                ]}
              >
                <Input.TextArea rows={5} placeholder="Nhập mô tả danh mục" />
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
                Lưu thay đổi
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default EditCategory;
