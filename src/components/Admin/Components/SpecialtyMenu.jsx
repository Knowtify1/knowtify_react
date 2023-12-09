import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Space, Tooltip } from "antd";
import {
  FileImageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

import adultDiseaseImage from "../../../assets/Book/InMedAdult.png";
import gynoImage from "../../../assets/Book/gynecology.png";
import hematology from "../../../assets/Book/hematology.png";
import infectiousdisease from "../../../assets/Book/infectiousdisease.png";
import orthoImage from "../../../assets/Book/orthopedics.png";
import pediatrics from "../../../assets/Book/pediatrics.png";
import pulmonology1 from "../../../assets/Book/pulmonology1.png";
import rehabImage from "../../../assets/Book/rehabilitation.png";

const SpecialtyMenuCard = ({ type }) => {
  const navigate = useNavigate();
  const { value, label } = type;
  //console.log(value);
  const handleButtonClick = (text) => {
    if (text == "schedule") {
      console.log("clicked schedule", value);
      navigate("../admincalendar", { state: { specialty: value } });
    } else if (text == "time") {
      //navigate("../admincalendar", { state: { specialty: value } });
      //console.log("clicked time");
    } else if (text == "notification") {
      //navigate("../admincalendar", { state: { specialty: value } });
      //console.log("clicked notification");
    }
  };

  return (
    <Card
      className="max-w-xs mx-auto mt-2 bg-green-700"
      style={{ width: "300px", height: "400px", paddingTop: "0" }}
      hoverable
    >
      <div className="flex flex-col h-full items-center justify-between">
        <div
          style={{
            width: "100%",
            height: "220px",
            overflow: "hidden",
          }}
        >
          <img
            src={type.images}
            alt={label}
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </div>
        <div className="w-full flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-bold mb-2 text-white text-center">
            {label}
          </h3>
          <Space
            direction="horizontal"
            size={15}
            style={{ width: "100%" }}
            className="justify-center"
          >
            <Tooltip title="View Schedule">
              <Button
                onClick={() => handleButtonClick("schedule")}
                type="primary"
                icon={<CalendarOutlined style={{ fontSize: "30px" }} />}
                className="mb-2"
                shape="circle"
                style={{ width: "60px", height: "60px" }}
              ></Button>
            </Tooltip>
            <Tooltip title="Time">
              <Button
                onClick={() => handleButtonClick("time")}
                type="primary"
                icon={<ClockCircleOutlined style={{ fontSize: "30px" }} />}
                className="mb-2"
                shape="circle"
                style={{ width: "60px", height: "60px" }}
              ></Button>
            </Tooltip>
            <Tooltip title="Notification">
              <Button
                onClick={() => handleButtonClick("notification")}
                type="primary"
                icon={<NotificationOutlined style={{ fontSize: "30px" }} />}
                className="mb-2"
                shape="circle"
                style={{ width: "60px", height: "60px" }}
              ></Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    </Card>
  );
};

const SpecialtyMenu = () => {
  const typesofDoc = [
    //dont change value!!!!!!!!
    {
      value: "Internal Medicine",
      label: "Internal Medicine",
      images: adultDiseaseImage,
    },
    {
      value: "Hematology",
      label: "Internal Medicine (Adult Hematology)",
      images: hematology,
    },
    {
      value: "Infectious",
      label: "Internal Medicine (Infectious Diseases)",
      images: infectiousdisease,
    },
    {
      value: "Pulmonology",
      label: "Internal Medicine (Pulmonology)",
      images: pulmonology1,
    },
    { value: "Ob", label: "Obstetrics and Gynecology", images: gynoImage },
    {
      value: "Orthopedics",
      label: "General Orthopaedic Surgery",
      images: orthoImage,
    },
    {
      value: "Physical",
      label: "Physical Medicine and Rehabilitation",
      images: rehabImage,
    },
    {
      value: "Pediatrics",
      label: "Pediatrics, Vaccines, and Immunizations",
      images: pediatrics,
    },
  ];

  //   const images = [
  //     adultDiseaseImage,
  //     hematology,
  //     infectiousdisease,
  //     pulmonology1,
  //     gynoImage,
  //     orthoImage,
  //     rehabImage,
  //     pediatrics,
  //   ];

  return (
    <>
      <div className="flex flex-wrap justify-center items-center ">
        {typesofDoc.map((type, index) => (
          <div key={index} className="m-2">
            <SpecialtyMenuCard type={type} />
          </div>
        ))}
      </div>
    </>
  );
};

export default SpecialtyMenu;
