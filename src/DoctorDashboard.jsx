// DoctorDashboard.jsx
import React from "react";
import { ConfigProvider, Layout, Button, Space } from "antd";
import { Logo } from "./components/Logo";
import { Outlet } from "react-router-dom";
import DoctorMenu from "./components/Doctor/DoctorMenu";
import DoctorSearch from "./components/Doctor/DoctorSearch";
import { useTheme } from "./ThemeContext";
import {
  FireFilled,
  MenuOutlined,
  CloseOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import knowtifylogov2 from "./assets/icon.ico";

const { Header, Sider } = Layout;

function DoctorDashboard() {
  const { darkTheme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);

  const siderStyle = {
    background: darkTheme ? "#001529" : "#fff",
    color: darkTheme ? "white" : "black",
    boxShadow: darkTheme ? "4px 0 4px rgba(0, 0, 0, 0.1)" : "none",
    transition: "width 0.1s",
    width: collapsed ? 250 : 500, // Adjusted width values
    minWidth: collapsed ? 80 : 250, // Adjusted min-width values
  };

  const headerStyle = {
    background: darkTheme ? "#001529" : "#fff",
    color: darkTheme ? "white" : "black",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
  };

  const layoutStyle = {
    width: "100%",
  };

  const logo = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    padding: "50px",
  };

  const logoIconStyle = {
    width: "55px",
    height: "55px",
    display: "flex",
    position: "fixed",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    borderRadius: "50%",
    // background: "rgba(28, 17, 41, 0.88)",
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ConfigProvider theme={darkTheme ? {} : { primaryColor: "#1890fff" }}>
      <Layout
        className={`h-screen ${darkTheme ? "dark" : ""}`}
        style={layoutStyle}
      >
        <Sider
          style={{ ...siderStyle, width: collapsed ? 250 : 500 }}
          theme={darkTheme ? "dark" : "light"}
          collapsed={collapsed}
          width={220}
        >
          <div style={logo}>
            <div style={logoIconStyle}>
              <img src={knowtifylogov2} alt="knowtifylogo" className="" />
            </div>
          </div>
          <DoctorMenu />
        </Sider>
        <Layout>
          {/* <Header style={headerStyle}>
            <div className="flex items-center">
              <Space direction="horizontal" size={10}>
                <h1>Welcome Doctor!</h1>
              </Space>
            </div>
            <DoctorSearch />
            <Button onClick={toggleTheme}>
              {darkTheme ? "Light" : "Dark"} Mode
            </Button>
          </Header> */}
          <div className="p-4">
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default DoctorDashboard;
