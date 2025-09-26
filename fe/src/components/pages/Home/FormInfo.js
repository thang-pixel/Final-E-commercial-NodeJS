import { SearchOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Typography,
  Row,
  Col,
  Card,
  Spin,
  Descriptions,
  message,
} from "antd";
import { DEBT_STATUS } from "../../../constants/debtStatus";
import { formatCurrency } from "../../../utils/formatCurrencyUtil";
import { useEffect, useState } from "react";
const { Text, Title } = Typography;

function FormInfo({ receiverData, setReceiverData }) {
  const [formReceiver] = Form.useForm(); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receiverData) {
      formReceiver.setFieldsValue({
        receiver_name: receiverData.full_name || "",
        receiver_tuition: receiverData.amount || "",
        receiver_term: receiverData.term || "",
        receiver_status: receiverData.status ? (
          <Text style={{ color: DEBT_STATUS[receiverData.status].color }}>
            DEBT_STATUS[receiverData.status].label
          </Text>
        ) : (
          ""
        ),
      });
    } else {
      formReceiver.resetFields();
    }
  }, [receiverData, formReceiver]);
  const handleSearchTuitionSt = () => {
    // Lấy giá trị của field
    const receiverId = formReceiver.getFieldValue("receiver_id");

    if (!receiverId && receiverId !== '') {
      message.warning("Nhap id sinh vien nop hoc phi");
      return;
    } // hoặc hiển thị message

    setLoading(true);

    setTimeout(() => {
      // Gọi API tìm kiếm ở đây
      const receiver = {
        id: receiverId,
        full_name: "Tran Minh Thuyen",
        term: "HK I năm học 2025-2026",
        amount: 20000000,
        status: DEBT_STATUS.OPEN.value,
      };
      setReceiverData(receiver);
      setLoading(false);
    }, 1000);
  };

  const handleInputReceiverChange = (values) => {
    setReceiverData(null);
  };

  return (
    <>
      <Row gutter={16} justify={"center"}>
        <Col xs={20} md={12}>
          <Card
            title={<Title level={4}>Thông tin nộp học phí</Title>}
            variant="borderless"
          >
            <Form
              layout={"vertical"}
              form={formReceiver}
              onValuesChange={handleInputReceiverChange}
              initialValues={{ layout: "vertical" }}
              // style={{ maxWidth: "1000px", minWidth: "700px" }}
            >
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Hãy nhập mã sinh viên đóng học phí!",
                  },
                ]}
                name="receiver_id"
                label="Mã sinh viên"
              >
                <Input
                  placeholder="Hãy nhập mã sinh viên đóng học phí"
                  suffix={
                    <SearchOutlined
                      onClick={handleSearchTuitionSt}
                      style={{ cursor: "pointer", color: "#1677ff" }}
                    />
                  }
                />
              </Form.Item>
            </Form>

            {/* Hiển thị thông tin học phí */}
            {receiverData && (
              <Descriptions
                bordered
                column={1}
                size="middle"
                style={{ marginTop: "20px" }}
              >
                <Descriptions.Item label="Họ và tên">
                  {receiverData.full_name}
                </Descriptions.Item>
                <Descriptions.Item label="Học kỳ">
                  {receiverData.term}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Text
                    style={{ color: DEBT_STATUS[receiverData?.status]?.color }}
                  >
                    {DEBT_STATUS[receiverData?.status]?.label}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Học phí">
                  {receiverData.amount
                    ? formatCurrency(receiverData.amount)
                    : ""}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Spin
            size="large"
            fullscreen
            delay={100}
            spinning={loading}
            tip={"Đang tìm kiếm"}
          />
        </Col>
      </Row>
    </>
  );
}

export default FormInfo;
