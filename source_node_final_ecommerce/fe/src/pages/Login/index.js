import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";

 
function Login(){
    const navigate = useNavigate();

    const handleLogin = (values) => {
        console.log("Login values:", values);

        navigate("/");
    }

    return (
        <>
            <h1>Login Page</h1>
            <Form name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600, margin: "0 auto", marginTop: "50px" }}
                initialValues={{ remember: true }}
                autoComplete="off"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input  placeholder="Username" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input placeholder="Password" />
                </Form.Item>
                <Form.Item
                    wrapperCol={{ offset: 8, span: 16 }}
                >
                    <Button type="primary" onClick={handleLogin}>Login</Button>
                </Form.Item>
            </Form>
        </>
    )
}

export default Login;