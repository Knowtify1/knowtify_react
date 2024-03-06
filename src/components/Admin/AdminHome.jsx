import React from "react";
import { Card, Calendar } from "antd";

import AdminOverview from "./Components/AdminOverview";
import SpecialtyMenu from "./Components/SpecialtyMenu";

function AdminHome() {
  return (
    <div className="flex">
      {/* Overview Section */}
      <Card
        className="pl-8 pr-4 pb-5 pt-2 custom-card"
        style={{ width: "100%", height: "auto" }}
      >
        <AdminOverview />

        {/* Specialty Menu Section */}
        <Card
          className="pl-8 pr-4 pb-5 pt-2 custom-card"
          style={{ width: "100%", height: "auto" }}
        >
          <SpecialtyMenu />
        </Card>
      </Card>
    </div>
  );
}

export default AdminHome;
