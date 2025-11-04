import { Button, Flex, Form, Input, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "./Login.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../redux/actions/authAction";

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

function Login() {
  const [form] = Form.useForm();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onInputChange = () => {
    setErr('');
  };

  const onFinish = async (values) => {
    const { Email, password } = values;
    setLoading(true);
    setErr('');
    const result = await dispatch(loginUser(Email, password));
    setLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setErr(result.message);
    }
  };

  return (
    <Flex align="center" justify="center" vertical>
      <div className="login">
        <h1>Login</h1>
        <Form
          layout={"vertical"}
          form={form}
          initialValues={{ remember: true }}
          style={{ maxWidth: 360 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onValuesChange={onInputChange}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input
              placeholder="Nhập email"
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu"
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          </Form.Item>
           
          <Typography.Text type="danger">{err}</Typography.Text>
          <Form.Item label={null}>
            <Button
              type="primary"
              className="login__submit"
              htmlType="submit"
              block
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <span>Bạn chưa có tài khoản? </span>
          <Button type="link" onClick={() => navigate("/register")}>
            Đăng ký
          </Button>
        </div>
      </div>
      <Spin size="large" fullscreen delay={100} spinning={loading} tip={'Đang xác thực'} />
    </Flex>
  );
}

export default Login;