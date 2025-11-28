import { useEffect } from 'react';
import { Container } from '@mui/material';
import {
  Card,
  Col,
  Tag,
  Image,
  Table,
  Button,
  message,
  Row,
  Modal,
  Form,
  Input,
  Select,
  notification,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Column from 'antd/es/table/Column';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  addProductVariant,
  deleteVariant,
  getProductById,
  updateVariant,
  updateVariantStatus,
} from '../../../redux/reducers/productSlice';
import { useState } from 'react';
import { buildSku } from '../../../utils/productVariantUtil';
import MoneyInput from '../../../components/common/MoneyInput';
import  './AdminProduct.css';
import { formatDateTimeVn } from '../../../utils/formatTime';
 
const { Paragraph } = Typography;

const useStyles = createStyles(() => ({
  root: {
    color: '#e0e0e0',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
}));

const DetailProduct = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [notiApi, notiContextHolder] = notification.useNotification();
  const [modal, modalContextHolder] = Modal.useModal();

  const navigate = useNavigate();
  const [formVariant] = Form.useForm();
  const { id } = useParams();

  const { categories } = useSelector((state) => state.categories);
  const { currentProduct } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [variantEditing, setVariantEditing] = useState(null);
  const [priceVariant, setPriceVariant] = useState(0);
  const [originalPriceVariant, setOriginalPriceVariant] = useState(0);
  const [stockVariant, setStockVariant] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');

  const openEditVariant = (variant) => {
    setVariantEditing(variant);
    setOpenVariantModal(true);

    setPriceVariant(variant?.price || 0);
    setOriginalPriceVariant(variant?.original_price || 0);
    setStockVariant(variant?.stock || 0);
  };

  // Xóa biến thể
  const handleDeleteVariant = async (variant) => {
    modal.confirm({
      title: 'Xác nhận xóa biến thể',
      content: `Bạn có chắc chắn muốn xóa biến thể với SKU: ${variant.SKU}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await dispatch(
            deleteVariant({
              variantId: variant._id,
              productId: currentProduct._id,
            })
          ).unwrap();
          notiApi.success({
            message: 'Xóa biến thể thành công',
            description: `Biến thể với SKU: ${variant.SKU} đã được xóa.`,
            duration: 3,
            showProgressBar: true,
          });
          dispatch(getProductById(id));
        } catch (error) {
          notiApi.error({
            message: 'Lỗi khi xóa biến thể',
            description: error.message || 'Đã xảy ra lỗi khi xóa biến thể.',
          });
        }
      },
    });
  };

  // Cập nhật trạng thái biến thể
  const handleChangeVariantStatus = async (variant, isActive) => {
    try {
      const newStatus = isActive ? 'ACTIVE' : 'INACTIVE';
      await dispatch(
        updateVariantStatus({
          variantId: variant._id,
          productId: currentProduct._id,
          status: newStatus,
        })
      ).unwrap();

      dispatch(getProductById(id));
    } catch (error) {
      notiApi.error({
        message: 'Lỗi khi cập nhật trạng thái biến thể',
        description:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái biến thể.',
      });
    }
  };

  // Xóa biến thể
  const handleSaveVariant = async (values) => {
    const { price, original_price, stock, status } = values;
    console.log('Values from form:', values);

    if (Number(price) < Number(original_price)) {
      setErrorMsg('Giá bán không được nhỏ hơn giá gốc');
      return;
    }
    if (Number(price) < 0 || Number(original_price) < 0 || Number(stock) < 0) {
      setErrorMsg('Giá bán, giá gốc và kho phải là số dương');
      return;
    }

    // attributes
    const attributes = Object.entries(values)
      .filter(
        ([key]) =>
          key !== 'price' &&
          key !== 'original_price' &&
          key !== 'stock' &&
          key !== 'status'
      )
      .map(([code, value]) => ({ code, value }));

    setErrorMsg(null); // Reset error message
    try {
      const payload = {
        product_id: currentProduct._id,
        attributes,
        price: Number(price),
        original_price: Number(original_price),
        stock: Number(stock),
        status: status || variantEditing.status,
      };

      let result = null;
      // kiem tra them moi hay cap nhat
      payload.SKU = buildSku(currentProduct._id, attributes); // tam thoi tao SKU nhu the nay

      console.log('Variant:', variantEditing);
      console.log('Payload to update variant: ', payload);
      if (variantEditing) {
        result = await dispatch(
          updateVariant({
            variantId: variantEditing._id,
            productId: currentProduct._id,
            ...payload,
          })
        ).unwrap();
      } else {
        // them moi
        result = await dispatch(
          addProductVariant({ productId: currentProduct._id, ...payload })
        ).unwrap();
      }

      console.log('Result from API:', result);

      notiApi.success({
        message: 'Lưu biến thể thành công',
        description: 'Biến thể sản phẩm đã được lưu thành công.',
      });

      // Reload product detail
      dispatch(getProductById(id));

      setOpenVariantModal(false);
      setVariantEditing(null);
      setErrorMsg(null);
      formVariant.resetFields();
      messageApi.success('Lưu biến thể thành công');
    } catch (err) {
      console.error('Error saving variant:', err);
      setErrorMsg(err.message || 'Đã xảy ra lỗi khi lưu biến thể');
    } finally {
      // handleCompleteSaveOrCloseModal();
    }
  };

  const handleCompleteSaveOrCloseModal = () => {
    setVariantEditing(null);
    setErrorMsg(null);
    formVariant.resetFields();
    setOriginalPriceVariant(0);
    setPriceVariant(0);
    setStockVariant(0);
    setOpenVariantModal(false);
  };

  const variantColumns = [
    { title: 'SKU', dataIndex: 'SKU', key: 'SKU', width: 200 },
    {
      title: 'Thuộc tính',
      key: 'attributes',
      width: 150,
      render: (_, variant) =>
        variant.attributes.map((attr, idx) => (
          <Tag color="blue" key={idx}>
            {attr.code}: {attr.value}
          </Tag>
        )),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price) =>
        price.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
    },
    {
      title: 'Giá gốc',
      dataIndex: 'original_price',
      key: 'original_price',
      width: 120,
      sorter: (a, b) => a.original_price - b.original_price,
      render: (price) =>
        price.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }),
    },
    { title: 'Kho', dataIndex: 'stock', key: 'stock', width: 100, sorter: (a, b) => a.stock - b.stock },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <>
          <Switch
            checked={record.status === 'ACTIVE'}
            checkedChildren="ACTIVE"
            unCheckedChildren="INACTIVE"
            onChange={(isChecked) =>
              handleChangeVariantStatus(record, isChecked)
            }
            style={{ width: 100 }}
          />
        </>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => formatDateTimeVn(date),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex-between">
          <Button
            type="link"
            onClick={() => openEditVariant(record)}
            icon={<EditOutlined type="small" />}
          ></Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteVariant(record)}
            icon={<DeleteOutlined type="small" />}
          ></Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    dispatch(getProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (variantEditing) {
      let attributesObj = {};
      variantEditing?.attributes.forEach((attr) => {
        attributesObj[attr.code] = attr.value;
      });

      formVariant.setFieldsValue({
        ...attributesObj,
        price: variantEditing?.price || 0,
        original_price: variantEditing?.original_price || 0,
        stock: variantEditing?.stock || 0,
        status: variantEditing?.status || 'ACTIVE',
      });

      setPriceVariant(variantEditing?.price || 0);
      setOriginalPriceVariant(variantEditing?.original_price || 0);
      setStockVariant(variantEditing?.stock || 0);
    } else {
      handleCompleteSaveOrCloseModal(); 
    }
  }, [variantEditing, formVariant]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {contextHolder}
      {notiContextHolder}
      {modalContextHolder}

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/admin/products')}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>
        Chi tiết sản phẩm
      </Typography>

      {!currentProduct ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* 1️⃣ Thông tin cơ bản */}
          <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={{ xs: 24, sm: 12 }}>
                <Typography.Text strong>Tên sản phẩm:</Typography.Text>
                <div>{currentProduct.name}</div>
              </Col>

              <Col span={{ xs: 24, sm: 12 }}>
                <Typography.Text strong>Danh mục:</Typography.Text>
                <div>{currentProduct.category_id.name}</div>
              </Col>

              <Col span={{ xs: 24, sm: 12 }}>
                <Typography.Text strong>Thương hiệu:</Typography.Text>
                <div>{currentProduct.brand_id.name}</div>
              </Col>

              <Col span={{ xs: 24, sm: 12 }}>
                <Typography.Text strong>Trạng thái:</Typography.Text>
                <Tag
                  color={currentProduct.status === 'ACTIVE' ? 'green' : 'red'}
                >
                  {currentProduct.status}
                </Tag>
              </Col>

              <Col span={24}>
                <Typography.Text strong>Mô tả:</Typography.Text>
                <Paragraph style={{ marginTop: 4 }} ellipsis={{ rows: 4 }}>
                  {currentProduct.description}
                </Paragraph>
              </Col>
            </Row>
          </Card>

          {/* 2️⃣ Ảnh sản phẩm */}
          <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 24 }}>
            {/* Thumbnail */}
            <Typography.Text strong>Ảnh đại diện</Typography.Text>
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <Image
                width={150}
                objectfit="contain"
                src={
                  currentProduct.images?.find((img) => img.type === 'THUMBNAIL')
                    ?.img_url
                }
              />
            </div>

            {/* Gallery */}
            <Typography.Text strong>Ảnh mô tả</Typography.Text>
            <Row gutter={[12, 12]} style={{ marginTop: 8 }}>
              {currentProduct.images
                ?.filter((img) => img.type === 'IMAGES')
                .map((img) => (
                  <Col span={6} key={img.id}>
                    <Image
                      src={img.img_url}
                      width="100%"
                      height={120}
                      style={{ objectFit: 'contain' }}
                    />
                  </Col>
                ))}
            </Row>
          </Card>

          {/* 3️⃣ Thông số kỹ thuật */}
          <Card title="Thông số kỹ thuật" style={{ marginBottom: 24 }}>
            <Table
              dataSource={currentProduct.specifications}
              pagination={false}
              rowKey="_id"
            >
              <Column title="Thuộc tính" dataIndex="key" key="key" />
              <Column title="Giá trị" dataIndex="value" key="value" />
            </Table>
          </Card>

          {/* 4️⃣ Biến thể sản phẩm */}
          <Card title="Biến thể sản phẩm">
            {/* Them bien the */}
            <Button
              type="primary"
              style={{ marginBottom: 16 }}
              onClick={() => openEditVariant(null)}
            >
              Thêm biến thể
            </Button>
            <Table
              dataSource={currentProduct.variants}
              columns={variantColumns}
              rowKey="SKU"
              bordered={true}
              pagination={false}
              scroll={{ x: '100%', y: 500 }}
              className="admin-product-table"
            />

            <Modal
              title={variantEditing ? 'Chỉnh sửa biến thể' : 'Thêm biến thể'}
              open={openVariantModal}
              onCancel={handleCompleteSaveOrCloseModal}
              footer={null}
              maskClosable={false} // ✅ Không cho đóng khi click vào overlay
              keyboard={false}     // ✅ (Optional) Không cho đóng khi nhấn ESC
            >
              <Form
                layout="vertical"
                form={formVariant}
                initialValues={{
                  price: variantEditing?.price || 0,
                  original_price: variantEditing?.original_price || 0,
                  stock: variantEditing?.stock || 0,
                  status: variantEditing?.status || 'ACTIVE',
                  ...variantEditing?.attributes?.reduce((acc, attr) => {
                    acc[attr.code] = attr.value;
                    return acc;
                  }, {}),
                }}
                onFinish={handleSaveVariant}
              >
                <Form.Item
                  name="original_price"
                  label="Giá gốc"
                  rules={[{ required: true }]}
                >
                  <MoneyInput
                    value={originalPriceVariant}
                    onChange={(value) => setOriginalPriceVariant(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[{ required: true }]}
                >
                  <MoneyInput
                    value={priceVariant}
                    onChange={(value) => setPriceVariant(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="stock"
                  label="Kho"
                  rules={[{ required: true }]}
                >
                  <MoneyInput
                    value={stockVariant}
                    onChange={(value) => setStockVariant(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                {/* Trạng thái */}
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: false }]}
                >
                  <Select>
                    <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                    <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                  </Select>
                </Form.Item>

                {/* Thuộc tính */}
                <Typography.Text strong>Thuộc tính</Typography.Text>
                {variantEditing?.attributes?.map((attr, idx) => (
                  <Form.Item
                    key={idx}
                    label={attr.code.toUpperCase()}
                    rules={[{ required: true }]}
                    name={attr.code}
                    // value={attr.value}
                  >
                    <Input />
                  </Form.Item>
                ))}
                {!variantEditing && (
                  <>
                    {currentProduct.category_id.attributes?.map((attr, idx) => (
                      <Form.Item
                        key={idx}
                        label={attr.label.toUpperCase()}
                        rules={[{ required: true }]}
                        name={attr.code}
                      >
                        <Input />
                      </Form.Item>
                    ))}
                  </>
                )}

                {errorMsg && (
                  <>
                    <Typography.Text type="danger">{errorMsg}</Typography.Text>
                  </>
                )}

                <Button type="primary" htmlType="submit" block>
                  Lưu thay đổi
                </Button>
              </Form>
            </Modal>
          </Card>
        </>
      )}
    </Container>
  );
};

export default DetailProduct;
