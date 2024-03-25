import { Card } from "antd";
import React from "react";
import TableAppointments from "./Components/TableAppointments";
import DoctorPatients from "./Components/DoctorPatients.jsx";

function DoctorAppointment() {
  return (
    <>
      <div className="pl-8 pr-8 pb-5 pt-5">
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Doctor Appointments
          </h3>{" "}
        </div>
        <Card>
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
