import { Button, Descriptions, Drawer, Spin } from "antd";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrencyUtil";

const Profile = ({ open, onClose, profile }) => {
    console.log(profile)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const showLoading = () => {
    setLoading(true);
    // Simple loading mock. You should add cleanup logic in real world.
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  return (
    <>
      <Drawer
        closable 
        title={<p>Thông tin hồ sơ</p>}
        placement="right"
        open={open}
        onClose={onClose}
        extra={
          <Button onClick={showLoading} type="primary">
            Reload
          </Button>
        }
      >
        <Spin spinning={loading} tip="Đang tải...">
        <Descriptions
          bordered
          column={1}
          size="middle"
          style={{ marginTop: 20 }}
        >
          <Descriptions.Item label="Họ tên">
            {profile?.full_name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profile?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {profile?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Số dư">
            {profile && profile.balance && formatCurrency(profile.balance)} 
          </Descriptions.Item>
          <Descriptions.Item label="Mã sinh viên">
            {profile?.username}
          </Descriptions.Item> 
        </Descriptions>
      </Spin>
      </Drawer>
    </>
  );
};
export default Profile;