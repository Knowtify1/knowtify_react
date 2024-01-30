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
    }
  };

  return (
    <div style={{ position: "fixed", height: "100%", width: "200px", top: "5%" }}>
      {/* You can adjust the width and other styles as needed */}
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        className="menubar"
        items={items}
      ></Menu>
    </div>
  );
};

export default AdminMenu;
