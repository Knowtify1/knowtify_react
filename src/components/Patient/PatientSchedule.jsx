import React from "react";
import { Calendar, Card } from "antd";
import PatientCalendar from "./Components/PatientCalendar";

function PatientSchedule() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold pt-10" style={{ color: "#333" }}>
          Patient Schedule
        </h3>{" "}
        <Card>
          <PatientCalendar />
        </Card>
      </div>
    </div>
  );
}

export default PatientSchedule;
