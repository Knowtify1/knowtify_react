import { Card } from "antd";
import React from "react";
import DoctorCalendar from "./Components/DoctorCalendar";

function DoctorSchedule() {
  return (
    <div className="container mx-auto p-0">
      <div className="flex flex-col gap-0 h-10">
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Doctor Calendar
          </h3>{" "}
        </div>
        <Card>
          <DoctorCalendar />
        </Card>
      </div>
    </div>
  );
}

export default DoctorSchedule;
