import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Space, Tooltip } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

import adultDiseaseImage from "../../../assets/Book/InMedAdult.png";
import gynoImage from "../../../assets/Book/gynecology.png";
import hematology from "../../../assets/Book/hematology.png";
import infectiousdisease from "../../../assets/Book/infectiousdisease.png";
import orthoImage from "../../../assets/Book/orthopedics.png";
import pediatrics from "../../../assets/Book/pediatrics.png";
import pulmonology1 from "../../../assets/Book/pulmonology1.png";
import rehabImage from "../../../assets/Book/rehabilitation.png";

const SpecialtyMenu = () => {
  const navigate = useNavigate();

  const handleButtonClick = (action, specialty) => {
    if (action === "schedule") {
      console.log("clicked schedule", specialty);
      navigate("../admincalendar", { state: { specialty } });
    }
    // Add handling for other actions if needed
  };

  const specialties = [
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

  // Divide the specialties into two arrays
  const halfLength = Math.ceil(specialties.length / 2);
  const firstHalf = specialties.slice(0, halfLength);
  const secondHalf = specialties.slice(halfLength);

  return (
    <div className="container mx-auto">
      <div className="flex">
        <div className="w-1/2 pr-4">
          <table className="table-fixed mx-auto border-collapse border border-green-800">
            <tbody>
              {firstHalf.map((specialty, index) => (
                <tr key={index} className="border-b border-green-800">
                  <td className="w-1/3 p-2 border-r border-green-800 text-center">
                    <img
                      src={specialty.images}
                      alt={specialty.label}
                      style={{
                        width: "130px",
                        height: "auto",
                        margin: "0 auto",
                      }}
                    />
                  </td>
                  <td className="w-1/2 p-2 border-r border-green-800 text-center">
                    <p style={{ fontSize: "16px" }}>{specialty.label}</p>
                  </td>
                  <td className="w-1/4 p-2 border-r border-green-800 text-center">
                    <Space>
                      <Tooltip title="View Schedule">
                        <Button
                          onClick={() =>
                            handleButtonClick("schedule", specialty.value)
                          }
                          type="primary"
                          icon={
                            <CalendarOutlined
                              style={{ fontSize: "20px", color: "green" }}
                            />
                          }
                        />
                      </Tooltip>
                    </Space>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-1/2 pl-4">
          <table className="table-fixed mx-auto border-collapse border border-green-800">
            <tbody>
              {secondHalf.map((specialty, index) => (
                <tr key={index} className="border-b border-green-800">
                  <td className="w-1/3 p-2 border-r border-green-800 text-center">
                    <img
                      src={specialty.images}
                      alt={specialty.label}
                      style={{
                        width: "130px",
                        height: "auto",
                        margin: "0 auto",
                      }}
                    />
                  </td>
                  <td className="w-1/2 p-2 border-r border-green-800 text-center">
                    <p style={{ fontSize: "16px" }}>{specialty.label}</p>
                  </td>
                  <td className="w-1/4 p-2 border-r border-green-800 text-center">
                    <Space>
                      <Tooltip title="View Schedule">
                        <Button
                          onClick={() =>
                            handleButtonClick("schedule", specialty.value)
                          }
                          type="primary"
                          icon={
                            <CalendarOutlined
                              style={{ fontSize: "20px", color: "green" }}
                            />
                          }
                        />
                      </Tooltip>
                    </Space>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyMenu;
