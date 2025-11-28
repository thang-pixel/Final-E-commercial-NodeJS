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
  Spin,
  Upload,
} from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { useDispatch, useSelector } from 'react-redux';
import {
  editCategory,
  getAllCategory,
  getCategoryById,
} from '../../../redux/reducers/categorySlice';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { AddAttribute } from './AddCategory';

const EditCategory = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { loading, categories, currentCategory } = useSelector(
    (state) => state.categories
  );
  const dispatch = useDispatch();
  const [attributes, setAttributes] = useState([]);

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
        image: currentCategory.image_url ? [
          {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: currentCategory.image_url,
          },
        ] : [],
      });
      setAttributes(currentCategory.attributes || []);
    }
  }, [currentCategory, form]);

  const handleSubmit = async (values) => {
    console.log('Submit payload:', values);
    if (attributes.length === 0) {
      messageApi.error('Vui lòng thêm thuộc tính cho danh mục!');
      return;
    }

    const setAttr = new Set();
    //  duyet key, value
    for (const attr of attributes) {
      if (!attr.code || !attr.label || !attr.type) {
        messageApi.error('Vui lòng điền đầy đủ thông tin thuộc tính!');
        return;
      }
      if (setAttr.has(attr.code)) {
        messageApi.error('Mã thuộc tính bị trùng!');
        return;
      }
      setAttr.add(attr.code);
    }

    const valuesSubmit = { ...values };
  
    if (values.image && values.image.length > 0) {
      valuesSubmit.image = values.image[0]?.originFileObj || null;
    } else {
      valuesSubmit.image_url = currentCategory.image_url || null;
    }
    
    valuesSubmit.attributes = attributes;
    console.log('Submitted values:', valuesSubmit);

    // return;
    try {
      const result = await dispatch(
        editCategory({ id, categoryData: valuesSubmit })
      ).unwrap();
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: PRODUCT_STATUS.ACTIVE.value }}
      >
        <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
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

          {/* Ảnh danh mục */}
          <Row>
            <Col span={24}>
              <Form.Item
                name="image"
                label="Ảnh danh mục"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[{ required: true, message: 'Hãy chọn ảnh danh mục' }]}
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
        </Card>

        {/* Thuoc tinh */}
        <AddAttribute
          attributes={attributes}
          setAttributes={setAttributes}
          showError={false}
        />
        {/* ================= Trạng thái & Lưu ================= */}
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
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

          <Col xs={24} sm={12} >
            <Button  
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%' }}
            >
              Lưu thay đổi
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default EditCategory;
