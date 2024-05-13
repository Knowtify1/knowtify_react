import React from "react";
import { Card } from "antd";
import DoctorEMRForms from "./Components/DoctorEMRForms";

function DoctorEMR() {
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
          <DoctorEMRForms />
        </Card>
      </div>
    </>
  );
}

export default DoctorEMR;
