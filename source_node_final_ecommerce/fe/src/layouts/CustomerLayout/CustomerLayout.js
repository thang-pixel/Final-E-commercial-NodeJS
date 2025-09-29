import { Link, Outlet } from "react-router-dom";
// import "./LayoutDefault.scss";
import { Flex, Typography } from "antd";
import CustomerFooter from "../../components/customer/Footer";
const { Text } = Typography;

function CustomerLayout(props) {
  const { user } = props;

  return (
    <div className="layout-customer">
      <header className="layout-customer__header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
      }}>
        <div className="layout-customer__logo">
          <Link to="/">
            <Flex vertical={false} align="center" justify="center">
              <div>
                <img
                src={"/tdtu_logo_rmbg.png"}
                style={{ height: "60px", width: "60px", objectFit: "cover" }}
                alt="Logo"
              />
              </div>
              <Text>CUSTOMER PAGE</Text>
            </Flex>
          </Link>
        </div>
        <div className="layout-customer__user">
          <Link to="/profile">
            <Text strong>Chào {user.username}!</Text>
          </Link>
        </div>
      </header>

      <main className="layout-customer__main" style={{
        minHeight: "80vh",
        backgroundColor: "aqua",
      }}>
        <Outlet context={{ props }} />
      </main>

      <footer className="layout-customer__footer">
        <CustomerFooter />
      </footer>
    </div>
  );
}

export default CustomerLayout;
