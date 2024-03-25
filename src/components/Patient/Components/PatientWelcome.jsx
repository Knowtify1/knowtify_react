import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, auth, db } from "../../../config/firebase.jsx";
import { Modal, Select, Button, Form, Card, Input } from "antd";

function PatientWelcome() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    const checkuser = async () => {
      try {
        const user = auth.currentUser;

        const userid = user.uid;

        console.log("Current user:", userid);
        if (!user) {
          console.error("User not authenticated.");
          return;
        }

        const userpatient = await getDoc(
          doc(db, "users_accounts_records", userid)
        );
        const userType = userpatient.data()?.type;
        const userpass = userpatient.data()?.password;
        console.log("User type:", userType);
        console.log("User password:", userpass);

        if (userType == "patient") {
          setIsModalVisible(true);
        } else {
          setIsModalVisible(false);
        }
      } catch (error) {
        console.error("CheckAndPromptSpecialty error:", error.message);
      }
    };

    checkuser();
  }, []);

  const handleModalOk = async () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // return (
  //   // <>
  //   //   {isModalVisible && (
  //   //     <Modal
  //   //       title="Account"
  //   //       open={isModalVisible}
  //   //       onOk={handleModalOk}
  //   //       onCancel={handleModalCancel}
  //   //       okButtonProps={{
  //   //         className: "bg-blue-500",
  //   //         style: { border: "1px solid #1890ff" },
  //   //       }}
  //   //     >
  //   //       <h1>Hi Patient this is your account welcome!!!!</h1>
  //   //     </Modal>
  //   //   )}
  //   // </>
  // );
}

export default PatientWelcome;
