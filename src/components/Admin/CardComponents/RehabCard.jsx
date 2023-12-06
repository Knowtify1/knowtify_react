// RehabCard.jsx
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import rehabImage from "/src/assets/Book/rehabilitation.png";

const { Meta } = Card;

const RehabCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div>
      <Card
        hoverable
        className="bg-green-700 text-white p-0"
        cover={<img src={rehabImage} alt="Rehabilitation" className="" />}
      >
        <h2 className="text-center">Physical Medicine & Rehabilitation</h2>
        <div className="flex justify-around p-4">
          <button
            className="icon-button"
            onClick={() => handleCalendarClick("Rehabilitation")}
          >
            <CalendarOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleAppointmentsClick("Rehabilitation")}
          >
            <ClockCircleOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleNotificationsClick("Rehabilitation")}
          >
            <NotificationOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default RehabCard;
