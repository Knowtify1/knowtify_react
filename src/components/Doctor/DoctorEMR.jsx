import React from "react";
import { Card } from "antd";
import DoctorEMRForms from "./Components/DoctorEMRForms";

function DoctorEMR() {
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center ">
                Patient EMR Record
              </h3>
            }
          >
            <DoctorEMRForms />
          </Card>
          <Card
            title={<h3 className="text-3xl font-semibold text-center"></h3>}
          ></Card>
        </div>
      </div>
    </>
  );
}

export default DoctorEMR;
