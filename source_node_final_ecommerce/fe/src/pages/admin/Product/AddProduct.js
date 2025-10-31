import { useState } from 'react';
import { Container, Typography } from '@mui/material';
import { Card, Input, Select, Button, Row, Col, message } from 'antd';
import TechnicalSpecs from '../../../components/admin/Product/TechnicalSpecs';
import AddProductVariant from '../../../components/admin/Product/AddProductVariant';
import ProductImage from '../../../components/admin/Product/ProductImage';
import { PRODUCT_STATUS } from '../../../constants/productConstant';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
// import axios from "axios";

const { Option } = Select;

const AddProduct = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState({
    name: '',
    brand_id: undefined,
    category_id: undefined,
    description: '',
    specifications: '',
    status: 'ACTIVE',
  });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [specs, setSpecs] = useState([]);

  const handleChange = (field, value) => {
    setProductInfo({ ...productInfo, [field]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...productInfo,
      images,
      variants,
    };

    console.log('Submit payload:', payload);
    messageApi.success('Đã lưu sản phẩm (fake API)');
    // await axios.post("/api/products", payload);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {contextHolder}
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

      {/* ================= Thông tin cơ bản ================= */}
      <Card title="Thông tin cơ bản" style={{ marginBottom: 20 }}>
        <Row style={{ marginBottom: 10 }}>
          <Col span={24}>
            <Input
              placeholder="Tên sản phẩm"
              value={productInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Select
              value={productInfo.brand_id}
              placeholder="Thương hiệu"
              style={{ width: '100%' }}
              onChange={(v) => handleChange('brand_id', v)}
            >
              <Option value={1}>Apple</Option>
              <Option value={2}>Samsung</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select
              value={productInfo.category_id}
              placeholder="Danh mục"
              style={{ width: '100%' }}
              onChange={(v) => handleChange('category_id', v)}
            >
              <Option value={10}>Điện thoại</Option>
              <Option value={20}>Laptop</Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ marginTop: 10 }}>
            <Input.TextArea
              rows={5}
              placeholder="Mô tả sản phẩm"
              value={productInfo.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      {/* ================= Thông số kỹ thuật ================= */}
      <TechnicalSpecs specs={specs} setSpecs={setSpecs} />

      {/* ================= Ảnh sản phẩm ================= */}
      <ProductImage images={images} setImages={setImages} />

      {/* ================= Biến thể sản phẩm ================= */}
      <AddProductVariant variants={variants} setVariants={setVariants} />

      {/* ================= Trạng thái & Lưu ================= */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Select
              value={productInfo.status}
              onChange={(v) => handleChange('status', v)}
              style={{ width: 200 }}
            >
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
          </Col>
          <Col>
            <Button type="primary" onClick={handleSubmit}>
              Lưu sản phẩm
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default AddProduct;
