import React from "react";
import DoctorPatients from "./Components/DoctorPatients";
import { Card } from "antd";
import DoctorPatientsRecords from "./Components/DoctorPatientsRecords";

function DoctorPatientRecord() {
  return (
    <>
      <div className="container mx-auto p-2">
        <div className="flex flex-col gap-5">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-left ">Patients</h3>
            }
            className="overflow-auto max-h-screen p-4" // Set a maximum height and padding

          >
            <DoctorPatients />
          </Card>
          <Card
            title={
              <h3 className="text-3xl font-semibold text-left">
                Patient Records
              </h3>
            }
            className="overflow-auto max-h-screen p-4" // Set a maximum height and padding

          >
            <DoctorPatientsRecords />
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorPatientRecord;
