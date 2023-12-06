// AdultDiseaseCard.jsx
import React from "react";
import { Card } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import adultDiseaseImage from "/src/assets/Book/InMedAdult.png";

const { Meta } = Card;

const AdultDiseaseCard = ({
  handleCalendarClick,
  handleAppointmentsClick,
  handleNotificationsClick,
}) => {
  return (
    <div>
      <Card
        hoverable
        className="bg-green-700 text-white p-0"
        cover={<img src={adultDiseaseImage} alt="Adult Disease" className="" />}
      >
        <h2 className="text-center">Internal Medicine</h2>
        <p className="text-center">(Specialized care for Adult Diseases)</p>
        <div className="flex justify-around p-4">
          <button
            className="icon-button"
            onClick={() => handleCalendarClick("Adult Disease")}
          >
            <CalendarOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleAppointmentsClick("Adult Disease")}
          >
            <ClockCircleOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            className="icon-button"
            onClick={() => handleNotificationsClick("Adult Disease")}
          >
            <NotificationOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdultDiseaseCard;
