import React from "react";
import { Button, Card, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import AdminAccountDetails from "./Components/AdminAccountDetails";
import { auth, signOut } from "../../config/firebase";
import a from "../../assets/a.png";
import DoctorsSchedule from "../Settings/DoctorsSchedule";

function AdminAccount() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <div>
      <div className="flex flex-row ">
        <Card style={{ width: 400, height: 735 }}>
          <div className="flex items-center justify-center mb-0">
            <Avatar size={120} src={a} />
          </div>
          <div className="mt-2 flex items-center justify-center">
            <AdminAccountDetails />
          </div>
          <br></br>
          <Button
            type="primary"
            style={{ backgroundColor: "red", borderColor: "red" }}
            onClick={handleSignOut}
            block
          >
            Logout
          </Button>
        </Card>
        <Card style={{ width: 950, height: 735 }}>
          <DoctorsSchedule />
        </Card>
      </div>
    </div>
  );
}

export default AdminAccount;
