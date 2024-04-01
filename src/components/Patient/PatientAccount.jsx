import React from "react";
import { Button, Card, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import PatientAccountDetails from "./Components/PatientAccountDetails";
import { auth, signOut } from "../../config/firebase";
import pat from "../../assets/pat.png";

function PatientAccount() {
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
    <div className="container mx-0 p-2">
      <div className="flex flex-col gap-4">
        <Card style={{ width: 400, height: 600 }}>
          <div className="flex items-center justify-center mb-2">
            <Avatar size={120} src={pat} />
          </div>
          <div className="mt-2 flex items-center justify-center"></div>
          <div className="mt-2 flex items-center justify-center">
            <PatientAccountDetails />
          </div>
          <br></br>
          <Button type="default" danger onClick={handleSignOut}>
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default PatientAccount;
