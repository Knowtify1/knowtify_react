import React, { useState } from "react";
import { Card } from "antd";
import TablePendingAppointments from "./Components/TablePendingAppointments";
import TableApprovedAppointments from "./Components/TableApprovedAppointments";

function AdminAppointment() {
  // State to hold the list of pending appointments
  const [pendingAppointments, setPendingAppointments] = useState([]);
  // State to hold the list of approved appointments
  const [approvedAppointments, setApprovedAppointments] = useState([]);

  // Function to approve an appointment
  const approveAppointment = (appointment) => {
    // Remove the approved appointment from pending appointments
    const updatedPendingAppointments = pendingAppointments.filter(
      (pending) => pending !== appointment
    );
    setPendingAppointments(updatedPendingAppointments);
    // Add the approved appointment to the list of approved appointments
    setApprovedAppointments([...approvedAppointments, appointment]);
  };

  return (
    <div className="container mx-auto p-5">
      <div className="flex flex-col gap-0">
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-5" style={{ color: "#333" }}>
            Pending Appointments
          </h3>{" "}
        </div>
        <Card>
          <TablePendingAppointments
            appointments={pendingAppointments}
            onApprove={approveAppointment}
          />
        </Card>
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-5" style={{ color: "#333" }}>
            Approved Appointments
          </h3>{" "}
        </div>
        <Card>
          <TableApprovedAppointments appointments={approvedAppointments} />
        </Card>
      </div>
    </div>
  );
}

export default AdminAppointment;
