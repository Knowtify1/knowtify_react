import React, { useState } from "react";
import { auth, signOut } from "../../config/firebase";
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
  const [selectedKeys, setSelectedKeys] = useState(["home"]);

  const handleMenuClick = ({ key }) => {
    // Add your logic based on the selected key
    console.log(`Clicked on menu item with key: ${key}`);
    setSelectedKeys([key]);

    if (key == "home") {
      navigate("adminhome");
    } else if (key == "appointment") {
      navigate("adminappointment");
    } else if (key == "schedule") {
      navigate("adminschedule");
    } else if (key == "patientrecord") {
      navigate("adminpatientrecord");
    } else if (key == "account") {
      navigate("adminaccount");
    } else if (key == "logout") {
      handleSignOut();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
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
