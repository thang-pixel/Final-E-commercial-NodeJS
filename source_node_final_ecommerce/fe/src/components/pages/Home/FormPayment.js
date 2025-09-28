import { useState } from "react";
import { 
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Spin,
  Descriptions,
  Tag,
  Modal,
} from "antd";
import { DEBT_STATUS } from "../../../constants/debtStatus";
import { formatCurrency } from "../../../utils/formatCurrencyUtil";
const { Title } = Typography;

function FormPayment({ profile, receiverData, onReset }) {
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [otp, setOtp] = useState("");

  const handlePayClick = () => {
    // Kiểm tra số dư trước khi mở modal
    if (profile.balance >= receiverData.amount) {
      setIsModalVisible(true);
    }
  };

  const handleOk = () => {
    console.log("OTP nhập:", otp);
    setLoadingPayment(true);

    // Gọi API verify OTP ở đây

    setTimeout(() => {
      setLoadingPayment(false);
      setIsModalVisible(false);
      setOtp("");

      if (onReset) onReset();
    }, 2000);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setOtp("");
  };

  return (
    <>
      <Row gutter={16} justify={"center"}>
        <Col xs={20} md={12}>
          <Card
            title={<Title level={4}>Thông tin thanh toán</Title>}
            variant="borderless"
          >
            {/* Hiển thị thông tin thanh toan */}
            {receiverData && receiverData.status === DEBT_STATUS.OPEN.value && (
              <>
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  style={{ marginTop: "20px" }}
                >
                  <Descriptions.Item label="Nguời nộp">
                    {profile.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số dư">
                    {formatCurrency(profile.balance)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nộp cho">
                    {receiverData.full_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tiền thanh toán">
                    {formatCurrency(receiverData.amount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Hướng dẫn">
                    {
                      <Tag
                        color={
                          profile.balance >= receiverData.amount
                            ? "blue"
                            : "orange"
                        }
                      >
                        {profile.balance >= receiverData.amount
                          ? "Nhấn nút để thanh toán"
                          : "Số dư không đủ để thanh toán"}
                      </Tag>
                    }
                  </Descriptions.Item>
                </Descriptions>

                <Button
                  type="primary"
                  disabled={profile.balance < receiverData.amount}
                  onClick={handlePayClick}
                >
                  Thanh toán
                </Button>

                <Modal
                  title="Xác thực OTP"
                  open={isModalVisible}
                  onOk={handleOk}
                  onCancel={handleCancel}
                  okText="Xác nhận"
                  cancelText="Hủy"
                >
                  <p>Vui lòng nhập mã OTP để hoàn tất thanh toán:</p>
                  <Input
                    placeholder="Nhập OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                </Modal>

                <Spin
                  size="large"
                  fullscreen
                  delay={100}
                  spinning={loadingPayment}
                  tip={"Đang xử lý thanh toán ..."}
                />
              </>
            )}

            {receiverData && receiverData.status === DEBT_STATUS.DONE.value && (
              <Descriptions
                bordered
                column={1}
                size="middle"
                style={{ marginTop: "10px" }}
              >
                <Descriptions.Item label="Chú thích">
                  {<Tag color="success">Sinh viên đã hoàn thành học phí</Tag>}
                </Descriptions.Item>
              </Descriptions>
            )}

            {receiverData &&
              receiverData.status === DEBT_STATUS.WAITING.value && (
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  style={{ marginTop: "10px" }}
                >
                  <Descriptions.Item label="Chú thích">
                    {
                      <Tag color="warning">
                        Học phí sinh viên đang được xử lý thanh toán{" "}
                      </Tag>
                    }
                  </Descriptions.Item>
                </Descriptions>
              )}
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default FormPayment;
