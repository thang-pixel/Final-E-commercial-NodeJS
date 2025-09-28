import { Card, Col, Input, Row } from "antd"; 
import { useEffect } from "react";
import { Form } from "antd";
import Title from "antd/es/typography/Title";

function FormPayer({ profile }) {
  const [formPayer] = Form.useForm();

  useEffect(() => {
    if (profile) {
      formPayer.setFieldsValue({
        payer_name: profile.full_name || "",
        payer_phone: profile.phone || "",
        payer_email: profile.email || "",
      });
    }
  }, [profile, formPayer]);

  return (
    <>    
      <Row gutter={[16, 16]} justify={"center"} style={{marginTop: '20px'}}>
        <Col xs={20} md={12}>
          <Card
            title={<Title level={4}>Thông tin người nộp</Title >}
            variant="borderless"
          >
            <Form
              form={formPayer}
              layout={"vertical"}
              initialValues={{ layout: "vertical" }}
              // style={{ maxWidth: "1000px", minWidth: "300px" }}
              // onValuesChange={onFormLayoutChange}
              // style={{ maxWidth: formLayout === 'inline' ? 'none' : 600 }}
            >
              <Form.Item name="payer_name" label="Họ và tên">
                <Input readOnly />
              </Form.Item>
              <Form.Item name="payer_phone" label="Số điện thoại">
                <Input readOnly />
              </Form.Item>
              <Form.Item name="payer_email" label="Địa chỉ email">
                <Input readOnly />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default FormPayer;
