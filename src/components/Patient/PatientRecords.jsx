import React from "react";
import { Card } from "antd";
import PatientsRecord from "./Components/PatientRecord";

function PatientRecords() {
  return (
    <>
      <div className="container mx-auto p-2">
        <div className="flex flex-col gap-5">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-left">
                Patient Record
              </h3>
            }
            className="overflow-auto max-h-screen p-4" // Set a maximum height and padding

          >
            <PatientsRecord/>
          </Card>
        </div>
      </div>
    </>
  );
}

export default PatientRecords;
