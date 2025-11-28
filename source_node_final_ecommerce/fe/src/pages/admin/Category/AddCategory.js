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
import {
  addCategory,
  getAllCategory,
} from '../../../redux/reducers/categorySlice';
import { useEffect, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const attributeTypes = ['text', 'number', 'color', 'select'];
const AddCategory = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);

  const [form] = Form.useForm();
  const { loading, categories } = useSelector((state) => state.categories);
  const dispatch = useDispatch();
  useEffect(() => {
    // Fetch categories for parent category selection
    dispatch(getAllCategory());
  }, [dispatch]);
  // const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
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
    valuesSubmit.image = null;
    valuesSubmit.image = values.image?.[0]?.originFileObj || null;
    valuesSubmit.attributes = attributes;
    console.log('Submitted values:', valuesSubmit);
    try {
      const result = await dispatch(addCategory(valuesSubmit)).unwrap();
      messageApi.success({
        content: `Thêm danh mục "${result?.data?.name}" thành công!`,
        duration: 2,
      });
      form.resetFields();
      setAttributes([]);
      navigate('/admin/categories');
    } catch (err) {
      messageApi.error(err.message || 'Thêm danh mục thất bại!');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {contextHolder}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/categories')}
        style={{ marginRight: 12 }}
      >
        Quay lại
      </Button>
      <Typography variant="h4" gutterBottom>
        Thêm danh mục
      </Typography>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: PRODUCT_STATUS.ACTIVE.value }}
      >
        {/* ================= Thông tin cơ bản ================= */}
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
                  allowClear
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
        <Row gutter={[8, 8]} justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Trạng thái">
              <Select style={{ width: '100%' }}>
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
              Lưu danh mục
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default AddCategory;

export const AddAttribute = ({ attributes, setAttributes, showError }) => {
  const addAttribute = () => {
    setAttributes([...attributes, { code: '', label: '', type: 'select' }]);
  };
  const updateAttribute = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };
  const removeAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  return (
    <Card title="Thuộc tính danh mục" style={{ marginBottom: 20 }}>
      {attributes.map((attr, i) => (
        <Row key={i} gutter={[8, 8]} align="middle" style={{ marginBottom: 8 }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Mã thuộc tính (code)"
              value={attr.code}
              onChange={(e) => updateAttribute(i, 'code', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Tên thuộc tính (label)"
              value={attr.label}
              onChange={(e) => updateAttribute(i, 'label', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              allowClear
              placeholder="Loại thuộc tính"
              value={attr.type}
              style={{ width: '100%' }}
              onChange={(value) => updateAttribute(i, 'type', value)}
            >
              {attributeTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={2}>
            <Button
              style={{ width: '100%' }}
              danger
              onClick={() => removeAttribute(i)}
            >
              Xóa
            </Button>
          </Col>
        </Row>
      ))}
      <Button type="dashed" onClick={addAttribute} style={{ width: '100%' }}>
        Thêm thuộc tính
      </Button>
    </Card>
  );
};
