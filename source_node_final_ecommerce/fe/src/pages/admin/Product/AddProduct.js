import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, message, Form, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TechnicalSpecs from '../../../components/admin/Product/TechnicalSpecs';
import AddProductVariant from '../../../components/admin/Product/AddProductVariant';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { getAllBrands } from '../../../redux/reducers/brandSlice';
import UploadImagesProduct from '../../../components/admin/Product/UploadImagesProduct';
import UploadThumbnailProduct from '../../../components/admin/Product/UploadThumbnailProduct';
import { addProduct } from '../../../redux/reducers/productSlice'; 
import { getAllCategory } from '../../../redux/reducers/categorySlice';
import { useGlobalLoading } from '../../../context/LoadingContext';
// import axios from "axios";

const { Option } = Select;

const AddProduct = () => {
  const { setSpinning } = useGlobalLoading();
  const [messageApi, contextHolder] = message.useMessage();
  const [notiApi, notiContextHolder] = notification.useNotification();
  const [formAdd] = Form.useForm();
  const navigate = useNavigate();
  const { categories } = useSelector(
    (state) => state.categories
  );
  const { brands } = useSelector(
    (state) => state.brands
  );
  const { message: messageAdd  } = useSelector(
    (state) => state.products
  );
  const dispatch = useDispatch();


  // lay tat ca danh muc
  useEffect(() => {
    dispatch(getAllCategory({ limit: 100}));
  }, [dispatch]);

  // lay tat ca thuong hieu
  useEffect(() => {
    dispatch(getAllBrands({ limit: 100}));
  }, [dispatch]);

  const getAttributeByCategory = (categoryId) => {
    if (!categoryId) return [];
    const category = categories.find((cat) => cat._id === categoryId);
    console.log('Category selected:', category);
    return category ? category.attributes : [];
  }

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [errors, setErrors] = useState({
    specs: false,
    thumbnail: false,
    images: false,
    variants: false,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState([]);

  const handleSubmit = async () => {
    const newErrors = {
      specs: specs.length === 0 || specs.some((s) => !s.key || !s.value),
      thumbnail: !thumbnail,
      images: images.length < 3,
      variants: variants.length < 2 || variants.some((v) => {
        // kiểm tra các thuộc tính động
        for (const attr of categoryAttributes) {
          if (!v.attributes?.[attr.code]) {
            return true;
          }
          if (!v.price || v.price <= 0) {
            return true;
          }
          if (!v.original_price || v.original_price <= 0) {
            return true;
          }
          if (!v.stock_quantity || v.stock_quantity < 0) {
            return true;
          }
        }
        return false;
      }),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      messageApi.error('Vui lòng điền đầy đủ thông tin sản phẩm!');
      const firstErrorKey = Object.keys(newErrors).find((k) => newErrors[k]);
      document
        .querySelector(`#section-${firstErrorKey}`)
        ?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const productInfo = formAdd.getFieldsValue(true);

    const formData = new FormData();
    formData.append('name', productInfo.name);
    formData.append('brand_id', productInfo.brand_id);
    formData.append('category_id', productInfo.category_id);
    formData.append('description', productInfo.description);
    formData.append('status', productInfo.status);
    console.log('Product Info:', JSON.stringify(specs), JSON.stringify(variants));
    formData.append('specifications', JSON.stringify(specs)); // object phải stringify
    formData.append('variants', JSON.stringify(variants));

    // 🔸 Ảnh đại diện
    formData.append('thumbnail', thumbnail.originFileObj);

    // 🔸 Ảnh mô tả
    images.forEach((file) => {
      formData.append('images', file.originFileObj);
    });

    // set loading state
    setIsAdding(true);
    setSpinning(true);
    console.log('Submitting product with data:', formData);
    try {

      const result = await dispatch(addProduct(formData)).unwrap();
      // messageApi.success({
      //   content: result.message || 'Thêm sản phẩm thành công!',
      //   duration: 2,
      // });
      notiApi.success({
        message: 'Thêm sản phẩm thành công!',
        description: result.message || 'Thêm sản phẩm thành công!',
        duration: 2,
      });
      // formAdd.resetFields();
      // setThumbnail(null);
      // setImages([]);
      // setVariants([]);
      // setSpecs([]);

      setTimeout(() => {
        navigate('/admin/products'); 
      }, 2000);
    } catch (error) {
      messageApi.error(error.message || 'Đã xảy ra lỗi khi lưu sản phẩm');
      console.error('Error saving product:', error);
    } finally {
      setIsAdding(false);
      setSpinning(false);
    }
    // await axios.post("/api/products", payload);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {contextHolder}
      {notiContextHolder}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/products')}
        style={{ marginRight: 12 }}
      >
        Quay lại
      </Button>
      <Typography variant="h4" gutterBottom>
        Thêm sản phẩm
      </Typography>

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        form={formAdd}
        onFinishFailed={({ errorFields }) => {
          if (errorFields.length > 0) {
            // focus vào field đầu tiên bị lỗi
            const firstError = errorFields[0];
            formAdd.scrollToField(firstError.name);
            formAdd.getFieldInstance(firstError.name)?.focus?.();
          }
        }}
        scrollToFirstError
        initialValues={{
          status: PRODUCT_STATUS.ACTIVE.value,
          name: 'Test 1',
          description: 'Mô tả sản phẩm test 1',
          brand_id: 1,
          category_id: 1, 
        }}
      >
        {/* ================= Thông tin cơ bản ================= */}
        <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                ]}
              >
                <Input placeholder="Tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Thương hiệu"
                name="brand_id"
                rules={[
                  { required: true, message: 'Vui lòng chọn thương hiệu' },
                ]}
              >
                <Select
                  placeholder="Thương hiệu"
                  showSearch 
                  style={{ width: '100%' }}
                  options={brands.map((item, idx) => ({
                    label: item.name,
                    value: item._id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Danh mục"
                name="category_id"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Danh mục"
                  showSearch 
                  style={{ width: '100%' }}
                  options={categories.map((item, idx) => ({
                    label: item.name,
                    value: item._id,
                  }))}
                  onChange={(val) => setCategoryAttributes(getAttributeByCategory(val))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả sản phẩm"
                name="description"
                rules={[
                  { required: true, message: 'Vui lòng nhập mô tả sản phẩm' },
                ]}
              >
                <Input.TextArea rows={5} placeholder="Mô tả sản phẩm"/>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {/* ================= Thông số kỹ thuật ================= */}
        <div id="section-specs">
          <TechnicalSpecs
            specs={specs}
            setSpecs={setSpecs}
            showError={errors.specs}
          />
        </div>

        {/* ================= Ảnh sản phẩm ================= */}
        <div id="section-thumbnail">
          <UploadThumbnailProduct
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            showError={errors.thumbnail}
          />
        </div>

        <div id="section-images">
          <UploadImagesProduct
            images={images}
            setImages={setImages}
            showError={errors.images}
          />
        </div>

        {/* ================= Biến thể sản phẩm ================= */}
        <div id="section-variants">
          <AddProductVariant
            variants={variants}
            setVariants={setVariants}
            showError={errors.variants}
            categoryAttributes={categoryAttributes}
          />
        </div>
        {/* ================= Trạng thái & Lưu ================= */}
        <Card>
          <Row gutter={[8, 8]} justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                style={{ width: '100%' }}
                rules={[
                  { required: true, message: 'Vui lòng chọn trạng thái' },
                ]}
              >
                <Select style={{ width: '100%' }}>
                  <Option value={PRODUCT_STATUS.ACTIVE.value}>
                    {PRODUCT_STATUS.ACTIVE.label}
                  </Option>
                  <Option value={PRODUCT_STATUS.INACTIVE.value}>
                    {PRODUCT_STATUS.INACTIVE.label}
                  </Option>
                  <Option value={PRODUCT_STATUS.OUT_OF_STOCK.value}>
                    {PRODUCT_STATUS.OUT_OF_STOCK.label}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%' }}
                loading={isAdding}
              >
                Lưu sản phẩm
              </Button>
            </Col>
          </Row>
        </Card>
      </Form>
    </Container>
  );
};

export default AddProduct;
