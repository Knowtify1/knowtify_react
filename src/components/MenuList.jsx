import { Menu } from "antd";
import {
  HomeOutlined,
  FileDoneOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  AccountBookOutlined,
  LogoutOutlined,
  ExclamationOutlined,
} from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";

export const MenuList = ({ darkTheme }) => {
  return (
    <Menu
      theme={darkTheme ? "dark" : "light"}
      mode="inline"
      className="menubar"
      style={{ height: "100%", overflowY: "auto", position: "fixed" }}
    >
      <Menu.Item key="home" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="appintment" icon={<FileDoneOutlined />}>
        Appointment
      </Menu.Item>
      <Menu.Item key="schedule" icon={<CalendarOutlined />}>
        Schedule
      </Menu.Item>
      <Menu.Item key="patientrecord" icon={<FileSearchOutlined />}>
        Patient Record
      </Menu.Item>
      <Menu.Item key="account" icon={<AccountBookOutlined />}>
        Account
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
      <Menu.SubMenu
        key="subtasks"
        title="other sub"
        icon={<ExclamationOutlined />}
      >
        <Menu.Item key="subtasks">sub of sub</Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
};
