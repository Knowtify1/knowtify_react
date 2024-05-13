import React from "react";
import { Card } from "antd";
import SpecialtyMenu from "./Components/SpecialtyMenu";

function AdminSchedule() {
  return (
    <>
      <div className="container mx-auto p-0">
        <div className="flex flex-col gap-0">
          <Card>
            <div className="w-full text-center">
              <h3
                className="text-3xl font-semibold pt-5"
                style={{ color: "#333" }}
              >
                Doctor Schedules
              </h3>{" "}
            </div>
            <SpecialtyMenu />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminSchedule;
