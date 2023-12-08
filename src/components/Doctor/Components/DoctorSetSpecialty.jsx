import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, auth, db } from "../../../config/firebase.jsx";
import { Modal, Select, Button } from "antd";

const { Option } = Select;

function DoctorSetSpecialty() {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const typesofDoc = [
    { value: "Internal Medicine", label: "Internal Medicine" },
    { value: "Hematology", label: "Internal Medicine (Adult Hematology)" },
    { value: "Infectious", label: "Internal Medicine (Infectious Diseases)" },
    { value: "Pulmonology", label: "Internal Medicine (Pulmonology)" },
    { value: "Ob", label: "Obstetrics and Gynecology" },
    { value: "Orthopedics", label: "General Orthopaedic Surgery" },
    { value: "Physical", label: "Physical Medicine and Rehabilitation" },
    { value: "Pediatrics", label: "Pediatrics, Vaccines, and Immunizations" },
  ];

  useEffect(() => {
    const checkAndPromptSpecialty = async () => {
      try {
        const user = auth.currentUser;
        console.log("Current user:", user);

        if (!user) {
          console.error("User not authenticated.");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userType = userDoc.data()?.type;
        console.log("User type:", userType);

        if (userType === "doctor") {
          const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
          const setSpecialty = doctorDoc.data()?.setSpecialty;

          console.log("setSpecialty:", setSpecialty);

          if (!setSpecialty) {
            setIsModalVisible(true);
          }
        }
      } catch (error) {
        console.error("CheckAndPromptSpecialty error:", error.message);
      }
    };

    checkAndPromptSpecialty();
  }, []);

  const handleModalOk = async () => {
    try {
      await updateDoc(doc(db, "doctors", auth.currentUser.uid), {
        setSpecialty: true,
        specialty: modalInput,
      });

      console.log("Doctor collection updated successfully");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating doctor collection:", error.message);
    }
  };

  const handleModalCancel = () => {
    navigate("doctorhome");
  };

  return (
    <>
      {isModalVisible && (
        <Modal
          title="Select Specialty"
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okButtonProps={{
            className: "bg-blue-500",
            style: { border: "1px solid #1890ff" },
          }}
        >
          <Select
            placeholder="Select your specialty"
            value={modalInput}
            onChange={(value) => setModalInput(value)}
            required
            className="w-full"
          >
            {typesofDoc.map((specialty) => (
              <Option key={specialty.value} value={specialty.value}>
                {specialty.label}
              </Option>
            ))}
          </Select>
        </Modal>
      )}
    </>
  );
}

export default DoctorSetSpecialty;
