import { Button, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../../redux/actions/authAction";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form] = Form.useForm();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErr('');
    const result = await dispatch(registerUser(values));
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setErr(result.message);
    }
  };

  return (
    <div className="register">
      <h1>Đăng ký tài khoản</h1>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        autoComplete="off"
        style={{ maxWidth: 360 }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Địa chỉ giao hàng"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Typography.Text type="danger">{err}</Typography.Text>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Register;