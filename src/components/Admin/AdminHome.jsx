// AdminHome.jsx
import React from "react";
import { Card } from "antd";

import AdminOverview from "./Components/AdminOverview";
import SpecialtyMenu from "./Components/SpecialtyMenu";

function AdminHome() {
  return (
    <>
      <div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <AdminOverview />
          </Card>
        </div>
        <div className="pl-8 pr-8 pb-5 pt-5">
          <Card>
            <SpecialtyMenu />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
