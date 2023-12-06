import React, { useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { MenuList } from "./components/MenuList";
import { Logo } from "./components/Logo";
import { ToggleThemeButton } from "./components/ToggleThemeButton";
import { Outlet } from "react-router-dom";

import DoctorMenu from "./components/Doctor/DoctorMenu";
import DoctorSearch from "./components/Doctor/DoctorSearch";

const { Header, Sider } = Layout;

function DoctorDashboard() {
  const [darkTheme, setDarkTheme] = useState(false);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };
  return (
    <ConfigProvider theme={{}}>
      <Layout>
        <Sider className="sidebar" theme={darkTheme ? "dark" : "light"}>
          <Logo />
          {/* <MenuList darkTheme={darkTheme} /> */}
          <DoctorMenu />
          {/* <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme} /> */}
        </Sider>
        <Layout>
          <div>
            <Header className="bg-white">
              <DoctorSearch />
            </Header>
          </div>
          <div>
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default DoctorDashboard;
