// GynoCard.jsx
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import gynoImage from "/src/assets/Book/gynecology.png";

const { Meta } = Card;

const GynoCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div>
      <Card
        hoverable
        className="bg-green-700 text-white p-0"
        cover={<img src={gynoImage} alt="Gynecology" className="" />}
      >
        <h2 className="text-center">Obstetrics & Gynecology</h2>
        <div className="flex justify-around p-4">
          <button
            className="icon-button"
            onClick={() => handleCalendarClick("Gynecology")}
          >
            <CalendarOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleAppointmentsClick("Gynecology")}
          >
            <ClockCircleOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleNotificationsClick("Gynecology")}
          >
            <NotificationOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default GynoCard;
