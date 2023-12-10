import React from "react";
import DoctorSetSpecialty from "./Components/DoctorSetSpecialty.jsx";
import { Card } from "antd";
import DoctorOverView from "./Components/DoctorOverView.jsx";

function DoctorHome() {
  return (
    <>
      <DoctorSetSpecialty />
      <div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <DoctorOverView />
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
