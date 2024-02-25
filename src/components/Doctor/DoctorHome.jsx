import React from "react";
import DoctorSetSpecialty from "./Components/DoctorSetSpecialty.jsx";
import { Card } from "antd";
import DoctorPatients from "./Components/DoctorPatients.jsx";

function DoctorHome() {
  return (
    <>
      <DoctorSetSpecialty />
    <div style={{ position: "relative", top: 0, left: 0, right: 0, bottom: 0, overflow: "auto" }}>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <DoctorPatients />
          </Card>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card></Card>
        </div>
      </div>
    </>
  );
}

export default DoctorHome;
