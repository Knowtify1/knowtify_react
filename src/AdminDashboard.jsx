import React, { useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { MenuList } from "./components/MenuList";
import { Logo } from "./components/Logo";
import { ToggleThemeButton } from "./components/ToggleThemeButton";
import { Outlet } from "react-router-dom";

import AdminMenu from "./components/Admin/AdminMenu";

const { Header, Sider } = Layout;

export function AdminDashboard() {
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
          <AdminMenu />
          {/* <ToggleThemeButton darkTheme={darkTheme} toggleTheme={toggleTheme} /> */}
        </Sider>
        <Layout>
          <div>
            <Header>Put search bar and other stuffs here</Header>
          </div>
          <div>
            <Outlet />
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default AdminDashboard;
