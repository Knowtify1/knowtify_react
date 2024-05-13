import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Space, Tooltip } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

import gyn from "../../../assets/Book/gyn.svg";
import hema from "../../../assets/Book/hema.svg";
import infect from "../../../assets/Book/infect.svg";
import ortho from "../../../assets/Book/ortho.svg";
import pedia from "../../../assets/Book/pedia.svg";
import pulmo from "../../../assets/Book/pulmo.svg";
import rehab from "../../../assets/Book/rehab.svg";
import internal from "../../../assets/Book/internal.svg";
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
      images: internal,
    },
    {
      value: "Hematology",
      label: "Internal Medicine (Adult Hematology)",
      images: hema,
    },
    {
      value: "Infectious",
      label: "Internal Medicine (Infectious Diseases)",
      images: infect,
    },
    {
      value: "Pulmonology",
      label: "Internal Medicine (Pulmonology)",
      images: pulmo,
    },
    { value: "Ob", label: "Obstetrics and Gynecology", images: gyn },
    {
      value: "Orthopedics",
      label: "General Orthopaedic Surgery",
      images: ortho,
    },
    {
      value: "Physical",
      label: "Physical Medicine and Rehabilitation",
      images: rehab,
    },
    {
      value: "Pediatrics",
      label: "Pediatrics, Vaccines, and Immunizations",
      images: pedia,
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
