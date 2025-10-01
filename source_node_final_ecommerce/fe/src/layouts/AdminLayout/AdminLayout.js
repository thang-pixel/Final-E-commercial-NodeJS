import { Link, Outlet } from "react-router-dom";
// import "./LayoutDefault.scss"; 
import { Flex, Typography } from "antd";  
import AdminFooter from "../../components/admin/AdminFooter";
// import { useEffect, useReducer, useState } from "react";
const { Text } = Typography;
function AdminLayout(props) {  
  const { user } = props;
  
  return (
    <div className="layout-admin">
      <header className="layout-admin__header">
        <div className="layout-admin__logo">
          <Link to="/">
            <Flex vertical={false} align="center" justify="center">
              <div>
                <img
                src={"/tdtu_logo_rmbg.png"}
                style={{ height: "60px", width: "60px", objectFit: "cover" }}
                alt="Logo"
              />
              </div>
              <Text>ADMIN PAGE</Text>
            </Flex>
          </Link>
        </div> 
        <div className="layout-admin__user">
          <Link to="/profile">
            <Text strong>Chào {user.username}!</Text>
          </Link>
        </div>
      </header>

      <main className="layout-admin__main" style={{
        minHeight: "80vh",
        backgroundColor: "aqua",
      }}>
        <Outlet context={{ props }} /> 
      </main>

      <footer className="layout-admin__footer">
        <AdminFooter />
      </footer>
    </div>
  );
}

export default AdminLayout;
