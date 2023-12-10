import React from "react";
import DoctorAccountDetails from "./Components/DoctorAccountDetails";
import { Card } from "antd";

function DoctorAccount() {
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center ">Account</h3>
            }
          >
            <DoctorAccountDetails />
          </Card>
        </div>
      </div>
    </>
  );
}

export default DoctorAccount;
