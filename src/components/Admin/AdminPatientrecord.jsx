import React from "react";
import PatientRecords from "./Components/PatientRecords";

import { Card } from "antd";

function AdminPatientrecord() {
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-0">
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-5"
              style={{ color: "#333" }}
            >
              Patient Records
            </h3>{" "}
          </div>
          <Card>
            <PatientRecords />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminPatientrecord;
