import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  AccountBookOutlined,
  LogoutOutlined,
  ExclamationOutlined,
} from "@ant-design/icons";

const items = [
  {
    label: "Home",
    key: "home",
    icon: <HomeOutlined />,
  },
  {
    label: "Appointment",
    key: "appointment",
    icon: <FileDoneOutlined />,
  },
  {
    label: "Schedule",
    key: "schedule",
    icon: <CalendarOutlined />,
  },
  {
    label: "Patient Record",
    key: "patientrecord",
    icon: <FileSearchOutlined />,
  },
  {
    label: "Account",
    key: "account",
    icon: <AccountBookOutlined />,
  },
  {
    label: "Logout",
    key: "logout",
    icon: <LogoutOutlined />,
  },
];

import { Menu } from "antd";

const AdminMenu = () => {
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState(["1"]);

  const handleMenuClick = ({ key }) => {
    // Add your logic based on the selected key
    console.log(`Clicked on menu item with key: ${key}`);
    setSelectedKeys([key]);

    // if (e.key == "home") {
    //   navigate("/");
    // } else if (e.key == "about") {
    //   navigate("/about");
    // } else if (e.key == "login") {
    //   navigate("/login");
    // } else if (e.key == "register") {
    //   navigate("/register");
    // }
    if (key == "home") {
      navigate("home");
    }
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleMenuClick}
      className="menubar"
      items={items}
    ></Menu>
  );
};

export default AdminMenu;
