import React from "react";
import { Outlet } from "react-router-dom";
import Footers from "./components/Footer/Footers";
import LandingHeader from "./components/Header/LandingHeader";
import { Layout, theme } from "antd";
const { Content } = Layout;

function Landing() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="layout">
      <Content
        style={{
          padding: "0 0",
        }}
        className="min-h-screen"
      >
        <div
          className="p-100 min-h-screen w-screen grid justify-center"
          style={{
            background: colorBgContainer,
          }}
        >
          <div className="justify-self-auto ">
            <Outlet className="" />
          </div>
        </div>
      </Content>
      <Footers />
    </Layout>
  );
}

export default Landing;
