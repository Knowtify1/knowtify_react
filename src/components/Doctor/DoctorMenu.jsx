import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signOut } from "../../config/firebase";
import {
  HomeOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  AccountBookOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Menu, Space } from "antd";
import { useTheme } from "../../ThemeContext";

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

function DoctorMenu() {
  const navigate = useNavigate();
  const { darkTheme } = useTheme();
  const [selectedKeys, setSelectedKeys] = useState(["home"]);

  const handleMenuClick = ({ key }) => {
    console.log(`Clicked on menu item with key: ${key}`);
    setSelectedKeys([key]);

    if (key === "home") {
      navigate("doctorhome");
    } else if (key === "appointment") {
      navigate("doctorappointment");
    } else if (key === "schedule") {
      navigate("doctorschedule");
    } else if (key === "patientrecord") {
      navigate("doctorpatientrecord");
    } else if (key === "account") {
      navigate("doctoraccount");
    }
  };

  

  const menuStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px", // Added gap for spacing
    fontSize: "1.1rem",
    position: "fixed", // Position fixed
    top: 80, // Adjust as needed
    left: 0, // Adjust as needed
    bottom: 0, // Adjust as needed
    width: 252,
    backgroundColor: darkTheme ? "#001529" : "#fff", // Adjust background color
    overflowY: "auto", // Enable scrolling if necessary
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      onClick={handleMenuClick}
      theme={darkTheme ? "dark" : "light"}
      style={menuStyle}
    >
      {items.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} style={{}}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );
}

export default DoctorMenu;
