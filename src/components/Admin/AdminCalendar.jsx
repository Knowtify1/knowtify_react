import React from "react";
import { Card } from "antd";
import AdminFullCalendar from "./Components/AdminFullCalendar";
import AdminDateCalendar from "./Components/AdminDateCalendar";

function AdminCalendar() {
  return (
    <>
      <div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <AdminFullCalendar />
          </Card>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <AdminDateCalendar />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminCalendar;
