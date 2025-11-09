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
  Skeleton,
} from 'antd';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllCategory } from '../../../redux/reducers/categorySlice';
import { editBrand, getBrandById } from '../../../redux/reducers/brandSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { API_DOMAIN } from '../../../constants/apiDomain';
import { ArrowLeftOutlined } from '@ant-design/icons';

const EditBrand = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  // load categories
  const { categories } = useSelector((state) => state.categories);
  const { currentBrand, loading } = useSelector((state) => state.brands);
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      dispatch(getBrandById(id));
    }
  }, [id, dispatch]);
  useEffect(() => {
    if (currentBrand) {
      console.log('Load brand to form:', currentBrand);
      form.setFieldsValue({
        name: currentBrand.name,
        description: currentBrand.description,
        status: currentBrand.deleted ? 'INACTIVE' : 'ACTIVE',
        category_id: currentBrand.category_id._id,
        image: currentBrand.image
          ? [
              {
                uid: '-1',
                name: currentBrand.image.split('/').pop(),
                status: 'done',
                url: `${API_DOMAIN}${currentBrand.image}`,
              },
            ]
          : [],
      });
    }
  }, [currentBrand, form, categories]);

  const handleSubmit = async (values) => {
    console.log('Submit payload:', values);

    let valuesSubmit = { ...values };
    if (Array.isArray(values.image) && values.image.length > 0) {
      const fileObj = values.image[0];
      if (fileObj.originFileObj) {
        // ảnh mới upload
        valuesSubmit.image = fileObj.originFileObj;
      } else if (fileObj.url) {
        // ảnh cũ giữ nguyên
        valuesSubmit.image = fileObj.url.replace(API_DOMAIN, '');
      } else {
        valuesSubmit.image = null;
      }
    } else {
      valuesSubmit.image = null;
    }
    try {
      const result = await dispatch(
        editBrand({ id, brandData: valuesSubmit })
      ).unwrap();
      
      await messageApi.success({
        content: (result.message || 'Cập nhật thương hiệu thành công!') + ' Về trang danh sách sau 3s.',
        duration: 3,
      });

      // ✅ Điều hướng về trang danh sách
      navigate('/admin/brands');
    } catch (error) {
      console.error('Edit Brand error:', error);
      messageApi.error(error.message || 'Cập nhật thương hiệu thất bại!');
    }
  };

  // load categories for selection
  useEffect(() => {
    dispatch(getAllCategory());
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
        Sửa thương hiệu
      </Typography>

      {/* ================= Thông tin cơ bản ================= */}
      <Skeleton
        active
        loading={loading || !currentBrand}
        paragraph={{ rows: 8 }}
        avatar={false}
      >
        <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={16}>
                <Form.Item
                  name="name"
                  label="Tên thương hiệu"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên thương hiệu',
                    },
                  ]}
                >
                  <Input placeholder="Tên thương hiệu" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="category_id"
                  label="Danh mục"
                  rules={[
                    { required: true, message: 'Vui lòng chọn danh mục' },
                  ]}
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
                    listType="picture-card"
                    maxCount={1}
                    accept="image/*"
                  >
                    <Button>Chọn ảnh</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[8, 8]} justify="space-between" align="middle">
              <Col xs={24} sm={12}>
                <Form.Item name="status" label="Trạng thái">
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
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Lưu thương hiệu
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Skeleton>
    </Container>
  );
};

export default EditBrand;
