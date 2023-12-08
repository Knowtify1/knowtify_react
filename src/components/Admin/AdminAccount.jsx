import React from "react";
import AdminAccountDetails from "./Components/AdminAccountDetails";
import { Card } from "antd";

function AdminAccount() {
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <Card
            title={
              <h3 className="text-3xl font-semibold text-center ">Account</h3>
            }
          >
            <AdminAccountDetails />
          </Card>
        </div>
      </div>
    </>
  );
}

export default AdminAccount;
