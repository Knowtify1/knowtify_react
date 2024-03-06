import { Card } from "antd";
import React from "react";
import TableAppointments from "./Components/TableAppointments";
import DoctorPatients from "./Components/DoctorPatients.jsx";

function DoctorAppointment() {
  return (
    <>
      <div className="pl-8 pr-8 pb-5 pt-5">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-left ">Patients</h3>
          }
          className="overflow-auto max-h-screen p-4" // Set a maximum height and padding
        >
          <DoctorPatients />
        </Card>
      </div>
      <div className="pl-8 pr-8 pb-5 pt-5">
        <Card></Card>
      </div>
    </>
  );
}

export default DoctorAppointment;
