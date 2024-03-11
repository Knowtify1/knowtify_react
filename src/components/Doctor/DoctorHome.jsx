import React from "react";
import DoctorSetSpecialty from "./Components/DoctorSetSpecialty.jsx";
import { Card } from "antd";

import DoctorOverview from "../Doctor/Components/DoctorOverView";

function DoctorHome() {
  return (
    <>
      <DoctorSetSpecialty />
      <div className="flex">
        {/* Overview Section */}
        <Card
          className="pl-8 pr-4 pb-5 pt-2 custom-card"
          style={{ width: "100%", height: "auto" }}
        >
          <DoctorOverview />
        </Card>
      </div>
    </>
  );
}

export default DoctorHome;
