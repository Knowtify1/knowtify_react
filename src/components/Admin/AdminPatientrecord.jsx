import React from "react";
import PatientRecords from "./Components/PatientRecords";

import { Card } from "antd";

function AdminPatientrecord() {
return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center">
                Patient Records
              </h3>
            }
          >
            <PatientRecords />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminPatientrecord;
