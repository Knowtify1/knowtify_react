import React from "react";
import DoctorPatients from "./Components/DoctorPatients";
import { Card } from "antd";
import DoctorPatientsRecords from "./Components/DoctorPatientsRecords";

function DoctorPatientRecord() {
  return (
    <>
      <div>
        <Card
          className="overflow-auto pl-5" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-0"
              style={{ color: "#333" }}
            >
              Patient Records
            </h3>{" "}
          </div>
          <DoctorPatientsRecords />
        </Card>
      </div>
    </>
  );
}

export default DoctorPatientRecord;
