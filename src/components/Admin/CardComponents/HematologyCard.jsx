// HematologyCard.jsx
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import hematology from "/src/assets/Book/hematology.png";

const { Meta } = Card;

const HematologyCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div>
      <Card
        hoverable
        className="bg-green-700 text-white p-0"
        cover={<img src={hematology} alt="Hematology" className="" />}
      >
        <h2 className="text-center">Internal Medicine</h2>
        <p className="text-center">(Adult Hematology)</p>
        <div className="flex justify-around p-4">
          <button
            className="icon-button"
            onClick={() => handleCalendarClick("Hematology")}
          >
            <CalendarOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleAppointmentsClick("Hematology")}
          >
            <ClockCircleOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleNotificationsClick("Hematology")}
          >
            <NotificationOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default HematologyCard;
