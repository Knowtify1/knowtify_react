import React, { useState } from "react";
import { Card } from "antd";
import { ConfigProvider, Layout } from "antd";
import { ToggleThemeButton } from "./components/ToggleThemeButton";
import { Outlet } from "react-router-dom";
import knowtifylogov2 from "./assets/icon.ico";

import PatientMenu from "./components/Patient/PatientMenu";

const { Header, Sider } = Layout;

export function PatientDashboard() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

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
          width={220}
        >
          <div style={logo}>
            <div style={logoIconStyle}>
              <img src={knowtifylogov2} alt="knowtifylogo" className="" />
            </div>
          </div>
          <PatientMenu />
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

export default PatientDashboard;
