import { Card, Typography, Upload } from 'antd';

const UploadImagesProduct = ({ images, setImages, showError }) => {
  return (
    <>
      <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 20 }}>
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false} // không upload thật, demo thôi
          accept="image/*"
          fileList={images}
          onChange={({ fileList }) => setImages(fileList)}
        >
          + Thêm ảnh
        </Upload>

        {/* ⚠️ Hiển thị lỗi tổng thể nếu không có ảnh nào */}
        {showError && images.length === 0 && (
          <Typography.Text
            type="danger"
            style={{ display: 'block', marginTop: 8 }}
          >
            Cần nhập ít nhất 3 hình ảnh sản phẩm
          </Typography.Text>
        )}
      </Card>
    </>
  );
};

export default UploadImagesProduct;
