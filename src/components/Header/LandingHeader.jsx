import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
const { Header } = Layout;

const items = [
  {
    label: "Home",
    key: "home",
  },
  {
    label: "About",
    key: "about",
  },
  {
    label: "Account",
    key: "SubMenu",
    children: [
      {
        type: "group",
        label: "",
        children: [
          {
            label: "Login",
            key: "login",
          },
          {
            label: "Register",
            key: "register",
          },
        ],
      },
    ],
  },
  // {
  //   label: (
  //     <a
  //       href="https://www.uc-bcf.edu.ph/"
  //       target="_blank"
  //       rel="noopener noreferrer"
  //     >
  //       University of Cordilleras
  //     </a>
  //   ),
  //   key: "uc",
  // },
];

function LandingHeader() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("home");
  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);

    if (e.key == "home") {
      navigate("/");
    } else if (e.key == "about") {
      navigate("/about");
    } else if (e.key == "login") {
      navigate("/login");
    } else if (e.key == "register") {
      navigate("/register");
    }
  };
  return (
    <Header className="bg-white">
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
        className=""
      />
    </Header>
  );
}

export default LandingHeader;
