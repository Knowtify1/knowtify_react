import { Card, Space } from "antd";
import React from "react";
import TableAppointments from "./Components/TableAppointments";

function AdminAppointment() {
  return (
    <>
      <div className="pl-8 pr-8 pb-5 pt-5">
        <div className="">
          <Card>
            <TableAppointments />
          </Card>
        </div>
        <div className="">
          <Card>wala laman</Card>
        </div>
        <div className="">
          <Card>wala laman</Card>
        </div>
        <div className="">
          <Card>wala laman</Card>
        </div>
      </div>
    </>
  );
}

export default AdminAppointment;
