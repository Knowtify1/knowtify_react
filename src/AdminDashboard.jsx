import React, { useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { Outlet } from "react-router-dom";
import knowtifylogov2 from "./assets/icon.ico";
import AdminMenu from "./components/Admin/AdminMenu";
import AdminSearch from "./components/Admin/AdminSearch";

const { Header, Sider } = Layout;

export function AdminDashboard() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const logo = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: "40px",
  };

  const logoIconStyle = {
    width: "55px",
    height: "55px",
    display: "flex",
    alignItems: "center",
    position: "fixed",
    justifyContent: "center",
    fontSize: "1.5rem",
    borderRadius: "50%",
    // background: "rgba(28, 17, 41, 0.88)",
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider theme={{}}>
      <Layout>
        <Sider
          theme={darkTheme ? "dark" : "light"}
          collapsed={collapsed}
          width={200}
        >
          <div style={logo}>
            <div style={logoIconStyle}>
              <img src={knowtifylogov2} alt="knowtifylogo" className="" />
            </div>
          </div>
          <AdminMenu />
        </Sider>
        <Layout>
          <div>
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default AdminDashboard;
