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

import { Menu } from "antd";

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

function DoctorMenu() {
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState(["home"]);

  const handleMenuClick = ({ key }) => {
    // Add your logic based on the selected key
    console.log(`Clicked on menu item with key: ${key}`);
    setSelectedKeys([key]);

    if (key == "home") {
      navigate("doctorhome");
    } else if (key == "appointment") {
      navigate("doctorappointment");
    } else if (key == "schedule") {
      navigate("doctorschedule");
    } else if (key == "patientrecord") {
      navigate("doctorpatientrecord");
    } else if (key == "account") {
      navigate("doctoraccount");
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
}

export default DoctorMenu;
