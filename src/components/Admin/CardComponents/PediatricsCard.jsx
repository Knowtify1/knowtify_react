// PediatricsCard.js
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import pediatrics from "/src/assets/Book/pediatrics.png";


const { Meta } = Card;

const PediatricsCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div><Card
      hoverable
      className="bg-green-700 text-white p-0"
      cover={<img src={pediatrics} alt="Pediatrics" className="" />}
    >
      <h2 className="text-center">Pediatrics, Vaccines, and Immunizations</h2>
      <div className="flex justify-around p-4">
        <button
          className="icon-button"
          onClick={() => handleCalendarClick("Pediatrics")}
        >
          <CalendarOutlined style={{ fontSize: "20px" }} />
        </button>
        <button
          className="icon-button"
          onClick={() => handleAppointmentsClick("Pediatrics")}
        >
          <ClockCircleOutlined style={{ fontSize: "20px" }} />
        </button>
        <button
          className="icon-button"
          onClick={() => handleNotificationsClick("Pediatrics")}
        >
          <NotificationOutlined style={{ fontSize: "20px" }} />
        </button>
      </div>
    </Card>
    </div>
  );
};

export default PediatricsCard;
