import { Card } from "antd";
import React from "react";
import TableAppointments from "./Components/TableAppointments";

function DoctorAppointment() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center ">
              Appointments
            </h3>
          }
        >
          <TableAppointments />
        </Card>

        <Card
          title={<h3 className="text-3xl font-semibold text-center"></h3>}
        ></Card>

        {/* Add more cards as needed */}
      </div>
    </div>
  );
}

export default DoctorAppointment;
