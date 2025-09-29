import { Button, Flex, Form, Input, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "./Login.scss";
import { API_DOMAIN } from "../../../constants/apiDomain";
import { useState } from "react";

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};
function Login() {
  const [form] = Form.useForm();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onInputChange = (val) =>{
    setErr('')
  }
  const onFinish = async (values) => {
    const { username, password } = values;
    const body = new URLSearchParams();
    // mo code comment khi chay
    // body.append("username", username);
    // body.append("password", password);
    // backdoor
    body.append("username", "52300070");
    body.append("password", "123456");
    setLoading(true);

    const res = await fetch(API_DOMAIN + "/auth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    await sleep(500);
    // setLoading(false)

    setTimeout(() => setLoading(false), 1000);

    if (res.status === 200) {
      const rs = await res.json();
      if (localStorage.getItem("access_token"))
        localStorage.removeItem("access_token");
      localStorage.setItem("access_token", rs.data.access_token);
      // chuyển hướng sau khi login thành công
      console.log(rs);
      navigate("/");
    } else if (res.status === 401) {
      const rs = await res.json();
      setErr(rs.message ? rs.message : rs.detail)
      console.log(rs);
    } else {
      console.error("Lỗi khác:", res.status);
    }
    // console.log(rs.data);
    // if (localStorage.getItem('access_token'))
    //   localStorage.removeItem('access_token')
    // localStorage.setItem("access_token", rs.data.access_token);
    // navigate("/");
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
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              placeholder="Nhập tên đăng nhập"
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
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
      </div>
       <Spin size="large" fullscreen delay={100} spinning={loading} tip={'Dang xac thuc'}/>
    </Flex>
  );
};
export default Login;
