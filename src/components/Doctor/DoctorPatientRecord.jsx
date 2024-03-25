import React from "react";
import DoctorPatients from "./Components/DoctorPatients";
import { Card } from "antd";
import DoctorPatientsRecords from "./Components/DoctorPatientsRecords";

function DoctorPatientRecord() {
  return (
    <>
      <div className="container mx-auto p-2">
        <div className="flex flex-col gap-0">
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-0"
              style={{ color: "#333" }}
            >
              Doctor Patients
            </h3>{" "}
          </div>
          <Card>
            <DoctorPatients />
          </Card>
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-5"
              style={{ color: "#333" }}
            >
              Patient Records
            </h3>{" "}
          </div>
          <Card>
            <DoctorPatientsRecords />
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorPatientRecord;
