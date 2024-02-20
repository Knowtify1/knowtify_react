import React from "react";
import { Card } from "antd";
import CreateAppointment from "./Components/CreateAppointment";

function PatientAppointment() {
  return (
    <div>
      <Card title="Welcome to Patient">
        <h3>Appointments</h3>
        <CreateAppointment />
      </Card>
    </div>
  );
}

export default PatientAppointment;
