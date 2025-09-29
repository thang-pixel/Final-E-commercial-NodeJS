import { Link, Outlet, useNavigate } from "react-router-dom";
import "./LayoutDefault.scss";
import { useEffect, useState } from "react";
import { get } from "../../utils/request";
import { Button, Dropdown, Flex, Space, Typography } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Profile from "../../pages/Profile";
const { Text } = Typography;
function LayoutDefault(props) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get("auth/users/me/");
        if (res.detail || res.status === "failed") {
          console.log(res);
          navigate("/login");
        } else {
          console.log(res);
          setProfile(res.data);
        }
      } catch (error) {
        console.log(error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // if (loading) {
  //   return (
  //     <div
  //       style={{ display: "flex", justifyContent: "center", padding: "2rem" }}
  //     >
  //       <Spin tip="Loading profile..." />
  //     </div>
  //   );
  // }

  // nếu không có profile (đã navigate ở trên) có thể return null
  if (!profile) return null;

  const items = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => setOpenProfile(true),
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: <Link to="logout">Đăng xuất</Link>,
    },
  ];
  return (
    <div className="layout-default">
      <header className="layout-default__header">
        <div className="layout-default__logo">
          <Link to="/">
            <Flex vertical={false} align="center" justify="center">
              <img
                src={"/tdtu_logo_rmbg.png"}
                style={{ height: "60px", width: "60px", objectFit: "cover" }}
                alt="Logo"
              />
              <Text>Cổng thanh toán học phí TDTU</Text>
            </Flex>
          </Link>
        </div>
        <div className="layout-default__account">
          {profile ? (
            <div style={{ cursor: "pointer" }}>
              <Dropdown menu={{ items }} placement="bottomRight" arrow>
                <Space style={{ cursor: "pointer" }}>
                  <Text strong>Hello {profile.full_name}</Text>
                  <DownOutlined />
                </Space>
              </Dropdown>
            </div>
          ) : (
            <Text>
              <Link to={"/login"}>Login</Link>
            </Text>
          )}
        </div>
      </header>

      <main className="layout-default__main">
        <Outlet context={{ profile }} />

        {profile && (
          <Profile
            open={openProfile}
            onClose={() => setOpenProfile(false)}
            profile={profile}
          />
        )}
      </main>

      <footer className="layout-default__footer">Tran Minh Thuyen</footer>
    </div>
  );
}

export default LayoutDefault;
