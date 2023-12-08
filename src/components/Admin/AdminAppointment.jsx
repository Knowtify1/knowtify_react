import { Card } from "antd";
import React from "react";
import TablePendingAppointments from "./Components/TablePendingAppointments";
import TableApprovedAppointments from "./Components/TableApprovedAppointments";

function AdminAppointment() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center ">
              Pending Appointments
            </h3>
          }
        >
          <TablePendingAppointments />
        </Card>

        <Card
          title={
            <h3 className="text-3xl font-semibold text-center">
              Approved Patients
            </h3>
          }
        >
          <TableApprovedAppointments />
        </Card>

        {/* Add more cards as needed */}
      </div>
    </div>
  );
}

export default AdminAppointment;
