import React from "react";
import { Card } from "antd";

import AdminOverview from "./Components/AdminOverview";

function AdminHome() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-center">
        <Card
          className="overflow-auto p-5"
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Admin Overview
          </h3>{" "}
          <AdminOverview />
        </Card>
      </div>
    </div>
  );
}

export default AdminHome;
