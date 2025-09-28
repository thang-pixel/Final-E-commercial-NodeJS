import { Table, Typography, Tag } from "antd";
import { formatCurrency } from "../../../utils/formatCurrencyUtil";
const { Text } = Typography;

// map màu theo status
const STATUS_MAP = {
  INTENDED: { color: "default", label: "Khởi tạo" },
  OTP_SENT: { color: "processing", label: "Đã gửi OTP" },
  SUCCESS: { color: "success", label: "Thành công" },
  FAILED: { color: "error", label: "Thất bại" },
  EXPIRED: { color: "warning", label: "Hết hạn" },
};

function PaymentHistory({ profile }) {
    const payments = [
    {
      id: "uuid-111",
      payer_id: 1001,
      student_id: "ST001",
      term: "2024A",
      amount: 20000000,
      status: "SUCCESS",
      created_at: "2025-09-01 09:00:00",
      updated_at: "2025-09-01 09:05:00",
    },
    {
      id: "uuid-112",
      payer_id: 1002,
      student_id: "ST002",
      term: "2024B",
      amount: 15000000,
      status: "FAILED",
      created_at: "2025-09-05 14:30:00",
      updated_at: "2025-09-05 14:32:00",
    },
    {
      id: "uuid-113",
      payer_id: 1003,
      student_id: "ST003",
      term: "2025A",
      amount: 18000000,
      status: "OTP_SENT",
      created_at: "2025-09-10 08:15:00",
      updated_at: "2025-09-10 08:20:00",
    },
  ];
  const columns = [
    {
      title: "Mã giao dịch",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text code>{id}</Text>,
    },
    {
      title: "Người nộp (payer_id)",
      dataIndex: "payer_id",
      key: "payer_id",
    },
    {
      title: "Mã sinh viên",
      dataIndex: "student_id",
      key: "student_id",
    },
    {
      title: "Kỳ học",
      dataIndex: "term",
      key: "term",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => formatCurrency(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const info = STATUS_MAP[status] || { color: "default", label: status };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={payments}
      pagination={{ pageSize: 2 }}
      bordered
    />
  );
}

export default PaymentHistory;
