import { Card } from "antd";
import React from "react";
import TablePendingAppointments from "./Components/TablePendingAppointments";
import TableApprovedAppointments from "./Components/TableApprovedAppointments";

function AdminAppointment() {
  return (
    <div className="container mx-auto p-10">
      <div className="flex flex-col gap-4">
        <Card
          title={
            <h3 className="text-3xl font-semibold text-center sticky top-0 bg-white">
              Pending Appointments
            </h3>
          }
          className="overflow-auto max-h-screen p-4" // Set a maximum height and padding
        >
          <TablePendingAppointments />
        </Card>

        <Card
          title={
            <h3 className="text-3xl font-semibold text-center sticky top-0 bg-white">
              Patients
            </h3>
          }
          className="overflow-auto max-h-screen p-4" // Set a maximum height and padding
        >
          <TableApprovedAppointments />
        </Card>

        {/* Add more cards as needed */}
      </div>
    </div>
  );
}

export default AdminAppointment;
