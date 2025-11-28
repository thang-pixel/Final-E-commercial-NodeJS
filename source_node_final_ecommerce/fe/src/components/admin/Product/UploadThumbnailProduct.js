import { Button, Card, Typography, Upload } from 'antd';

const UploadThumbnailProduct = ({ thumbnail, setThumbnail, showError }) => {
  return (
    <>
      <Card title="Ảnh đại diện" style={{ marginBottom: 20 }}>
        <Upload
          beforeUpload={() => false}
          listType="picture-card" // 🖼️ Hiển thị dạng ảnh nhỏ
          maxCount={1} // ✅ Chỉ cho chọn 1 file
          accept="image/*"
          fileList={thumbnail ? [thumbnail] : []}
          onChange={({ fileList }) => setThumbnail(fileList[0] || null)}
        >
          <Button>Chọn ảnh</Button>
        </Upload>

        {/* ⚠️ Hiển thị lỗi tổng thể nếu không có thông số nào */}
        {showError && !thumbnail && (
          <Typography.Text
            type="danger"
            style={{ display: 'block', marginTop: 8 }}
          >
            Cần nhập ít nhất 1 ảnh đại diện
          </Typography.Text>
        )}
      </Card>
    </>
  );
};

export default UploadThumbnailProduct;
