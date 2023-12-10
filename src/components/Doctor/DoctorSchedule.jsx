import { Card } from "antd";
import React from "react";
import DoctorCalendar from "./Components/DoctorCalendar";

function DoctorSchedule() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center ">Calendar</h3>
          }
        >
          <DoctorCalendar />
        </Card>

        <Card
          title={<h3 className="text-3xl font-semibold text-center"></h3>}
        ></Card>

        {/* Add more cards as needed */}
      </div>
    </div>
  );
}

export default DoctorSchedule;
