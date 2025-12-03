import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, message, Form, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TechnicalSpecs from '../../../components/admin/Product/TechnicalSpecs';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { getAllBrands } from '../../../redux/reducers/brandSlice';
import UploadImagesProduct from '../../../components/admin/Product/UploadImagesProduct';
import UploadThumbnailProduct from '../../../components/admin/Product/UploadThumbnailProduct';
import {
  editProduct,
  getProductById,
} from '../../../redux/reducers/productSlice';
import { getAllCategory } from '../../../redux/reducers/categorySlice';
// import axios from "axios";

const { Option } = Select;

const EditProduct = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [notiApi, notiContextHolder] = notification.useNotification();
  const [formEdit] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const { categories } = useSelector((state) => state.categories);
  const { brands } = useSelector((state) => state.brands);
  const { message: messageEdit, currentProduct } = useSelector(
    (state) => state.products
  );
  const dispatch = useDispatch();

  // lay tat ca danh muc
  useEffect(() => {
    dispatch(getAllCategory({ limit: 100 }));
  }, [dispatch]);

  // lay tat ca thuong hieu
  useEffect(() => {
    dispatch(getAllBrands({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      // Fetch the product details by id and set the form fields
      dispatch(getProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct) {
      // set lai gia tri form khi currentProduct thay doi
      formEdit.setFieldsValue({
        name: currentProduct.name,
        brand_id: currentProduct.brand_id?._id,
        category_id: currentProduct.category_id?._id,
        description: currentProduct.description,
        status: currentProduct.status,
      });
      

      // set anh
      const imagesWithoutThumbnail = currentProduct.images.filter(
        (img) => img.type !== 'THUMBNAIL'
      );
      const thumbnailImage = currentProduct.images.find(
        (img) => img.type === 'THUMBNAIL'
      );
      // console.log('Thumnail image:', thumbnailImage);
      // console.log('Images without thumbnail:', imagesWithoutThumbnail);
      setThumbnail({
        uid: '-1',
        name: thumbnailImage?.img_url.split('/').pop(),
        status: 'done',
        url: thumbnailImage?.img_url,
      });
      setImages(
        imagesWithoutThumbnail.map((img, index) => ({
          uid: '-1' + index,
          name: 'image.png',
          status: 'done',
          url: img.img_url,
        }))
      );

      // set specs
      setSpecs(currentProduct.specifications);
    }
  }, [currentProduct, formEdit]);

  // const getAttributeByCategory = (categoryId) => {
  //   if (!categoryId) return [];
  //   const category = categories.find((cat) => cat._id === categoryId);
  //   console.log('Category selected:', category);
  //   return category ? category.attributes : [];
  // };

  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  // const [variants, setVariants] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [errors, setErrors] = useState({
    specs: false,
    thumbnail: false,
    images: false,
    variants: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async () => {
    const newErrors = {
      specs: specs?.length === 0 || specs.some((s) => !s?.key || !s.value),
      thumbnail: !thumbnail,
      images: images?.length < 3,
      // variants: variants?.length === 0,
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

    const productInfo = formEdit.getFieldsValue(true);

    const formData = new FormData();

    formData.append('name', productInfo.name);
    formData.append('brand_id', parseInt(productInfo.brand_id, 10));
    formData.append('category_id', parseInt(productInfo.category_id, 10));
    formData.append('description', productInfo.description);
    formData.append('status', productInfo.status);
    formData.append('specifications', JSON.stringify(specs)); // object phải stringify
    // formData.append('variants', JSON.stringify(variants));

    // 🔸 Ảnh đại diện
    if (thumbnail?.originFileObj)
      formData.append('thumbnail', thumbnail.originFileObj);

    // 🔸 Ảnh mô tả
    if (images?.length > 0) {
      images.forEach((file) => {
        if (file.originFileObj) formData.append('images', file.originFileObj);
      });
    }

    // set loading state
    setIsEditing(true);
    console.log(specs, thumbnail, images);
    console.log('Product Info:', productInfo);
    // for (const [key, value] of formData.entries()) {
    //   console.log('FD =>', key, value);
    // }
    try {
      const result = await dispatch(
        editProduct({ productId: id, productData: formData })
      ).unwrap();

      // messageApi.success({
      //   content: result.message || 'Cập nhật sản phẩm thành công',
      //   duration: 2,
      // });

      notiApi.success({
        message: 'Cập nhật sản phẩm thành công',
        description: result.message || 'Cập nhật sản phẩm thành công',
      });

      // formEdit.resetFields();
      // setThumbnail(null);
      // setImages([]);
      // setVariants([]);
      // setSpecs([]);

      navigate('/admin/products');
    } catch (error) {
      // messageApi.error(error.message || 'Đã xảy ra lỗi khi lưu sản phẩm');
      notiApi.error({
        message: 'Lỗi khi cập nhật sản phẩm',
        description: error.message || 'Đã xảy ra lỗi khi lưu sản phẩm',
      });
      console.error('Error saving product:', error);
    } finally {
      setIsEditing(false);
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
      <Typography variant="h5" sx={{ mt: 1, textAlign: 'center' }} gutterBottom>
        Chỉnh sửa sản phẩm
      </Typography>

      {!currentProduct ? (
        <div>Loading...</div>
      ) : (
        <>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            form={formEdit}
            onFinishFailed={({ errorFields }) => {
              if (errorFields.length > 0) {
                // focus vào field đầu tiên bị lỗi
                const firstError = errorFields[0];
                formEdit.scrollToField(firstError.name);
                formEdit.getFieldInstance(firstError.name)?.focus?.();
              }
            }}
            scrollToFirstError
             
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
                    >
                      {brands.map((item, idx) => (
                        <Option key={idx} value={parseInt(item._id, 10)}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Danh mục"
                    name="category_id"
                    rules={[
                      { required: true, message: 'Vui lòng chọn danh mục' },
                    ]}
                  >
                    <Select
                      placeholder="Danh mục"
                      showSearch
                      style={{ width: '100%' }}
                    >
                      {categories.map((item, idx) => (
                        <Option key={idx} value={parseInt(item._id, 10)}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Mô tả sản phẩm"
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập mô tả sản phẩm',
                      },
                    ]}
                  >
                    <Input.TextArea rows={5} placeholder="Mô tả sản phẩm" />
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
            {/* <div id="section-variants">
          <AddProductVariant
            variants={variants}
            setVariants={setVariants}
            showError={errors.variants}
            categoryAttributes={categoryAttributes}
          />
        </div> */}
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
                    loading={isEditing}
                  >
                    Lưu thay đổi
                  </Button>
                </Col>
              </Row>
            </Card>
          </Form>
        </>
      )}
    </Container>
  );
};

export default EditProduct;
