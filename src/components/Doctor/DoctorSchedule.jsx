import { Card } from "antd";
import React from "react";
import DoctorCalendar from "./Components/DoctorCalendar";

function DoctorSchedule() {
  return (
    <div className="container mx-auto p-0">
      <div className="flex flex-col gap-0 h-10">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center">Calendar</h3>
          }
          className="container mx-auto p-0" // Allow the card to take up remaining vertical space
        >
          <DoctorCalendar />
        </Card>
      </div>
    </div>
  );
}

export default DoctorSchedule;
