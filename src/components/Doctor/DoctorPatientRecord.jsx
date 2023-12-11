import React from "react";
import DoctorPatients from "./Components/DoctorPatients";
import { Card } from "antd";
import DoctorPatientsRecords from "./Components/DoctorPatientsRecords";

function DoctorPatientRecord() {
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center ">Patients</h3>
            }
          >
            <DoctorPatients />
          </Card>
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center">
                Patient Records
              </h3>
            }
          >
            <DoctorPatientsRecords />
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorPatientRecord;
