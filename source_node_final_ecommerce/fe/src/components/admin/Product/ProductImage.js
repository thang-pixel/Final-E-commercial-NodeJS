import { Card, Upload } from "antd";

const ProductImage = ({ images, setImages }) => {
    return (
        <>
            <Card title="Hình ảnh sản phẩm" style={{ marginBottom: 20 }}>
                <Upload
                    listType="picture-card"
                    multiple
                    beforeUpload={() => false} // không upload thật, demo thôi
                    onChange={({ fileList }) => setImages(fileList)}
                >
                    + Thêm ảnh
                </Upload>
            </Card>
        </>
    );
}

export default ProductImage;