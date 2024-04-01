import React from "react";
import { Card, Calendar } from "antd";

import AdminOverview from "./Components/AdminOverview";
import SpecialtyMenu from "./Components/SpecialtyMenu";

function AdminHome() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold pt-10" style={{ color: "#333" }}>
          Admin Overview
        </h3>{" "}
        <Card
          className="overflow-auto max-h-screen p-0" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <AdminOverview />
        </Card>
      </div>
    </div>
  );
}

export default AdminHome;
