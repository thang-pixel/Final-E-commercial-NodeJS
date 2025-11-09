import { Button, Flex, Form, Input, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "./Login.scss";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {useSelector} from 'react-redux';
import { useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { socialLoginUser, guestLoginUser, loginUser } from "../../../redux/actions/authAction";

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

function Login() {
  const [form] = Form.useForm();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const onInputChange = () => {
    setErr('');
  };

  const onFinish = async (values) => {
    const { Email, password } = values;
    setLoading(true);
    setErr('');
    const result = await dispatch(loginUser(Email, password));
    setLoading(false);
    if(!result.success){
      setErr(result.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setErr("Google login failed");
      return;
    }
    setLoading(true);
    const result = await dispatch(socialLoginUser("google", idToken));
    setLoading(false);
    if (!result.success) setErr(result.message);
  };

  const handleGuest = async () => {
    setLoading(true);
    const result = await dispatch(guestLoginUser());
    setLoading(false);
    if (!result.success) setErr(result.message);
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);


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
          

        <div style={{ marginTop: 8, textAlign: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setErr("Google login error")}
          />
        </div>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Button icon={<UserOutlined />} onClick={handleGuest}>
            Continue as Guest
          </Button>
        </div>

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