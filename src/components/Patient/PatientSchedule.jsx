import React from "react";
import { Calendar, Card } from "antd";
import PatientCalendar from "./Components/PatientCalendar";




function PatientSchedule() {
  return (
    <div className="container mx-auto p-0">
      <div className="flex flex-col gap-0 h-10">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center">Calendar</h3>
          }
          className="container mx-auto p-0" // Allow the card to take up remaining vertical space
        >
          <PatientCalendar />
        </Card>
      </div>
    </div>
  );
}

export default PatientSchedule;
