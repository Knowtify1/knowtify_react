// PulmonologyCard.jsx
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import pulmonology1 from "/src/assets/Book/pulmonology1.png";

const { Meta } = Card;

const PulmonologyCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div>
      <Card
        hoverable
        className="bg-green-700 text-white p-0"
        cover={<img src={pulmonology1} alt="Pulmonology" className="" />}
      >
        <h2 className="text-center">Internal Medicine</h2>
        <p className="text-center">(Pulmonology)</p>
        <div className="flex justify-around p-4">
          <button
            className="icon-button"
            onClick={() => handleCalendarClick("Pulmonology")}
          >
            <CalendarOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleAppointmentsClick("Pulmonology")}
          >
            <ClockCircleOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleNotificationsClick("Pulmonology")}
          >
            <NotificationOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PulmonologyCard;
