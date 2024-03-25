import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "../../../config/firebase.jsx";
import { Table, Typography, Button, Input, message, Space } from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "patient_accounts"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserDetails(userData);
            const name = userData.name;
            fetchPatientDetails(name);
          } else {
            console.error("No user data found in patient collection.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      } else {
        setUserDetails(null);
        setPatientDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (name) => {
    try {
      const patientsCollection = collection(db, "patientRecords");
      const patientQuery = query(
        patientsCollection,
        where("patientName", "==", name)
      );
      const patientQuerySnapshot = await getDocs(patientQuery);

      if (!patientQuerySnapshot.empty) {
        const patientData = patientQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPatientDetails(patientData);
        const initialEditableRows = {};
        const initialEditedData = {};
        patientData.forEach((_, index) => {
          initialEditableRows[index] = false; // Set all rows as not editable initially
          initialEditedData[index] = { ...patientData[index] };
        });
        setEditableRows(initialEditableRows);
        setEditedData(initialEditedData);
      } else {
        console.error("No patient data found for the given name.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const columns = [
    {
      title: "Specialty Doctor",
      dataIndex: "typeOfDoctor",
      key: "typeOfDoctor",
    },
    {
      title: "Diagnosis",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    {
      title: "Investigations ordered (labs, imaging, etc.)",
      dataIndex: "investigationsOrdered",
      key: "investigationsOrdered",
    },
    {
      title: "Treatment plan",
      dataIndex: "treatmentPlan",
      key: "treatmentPlan",
    },
    {
      title: "Referrals (if any)",
      dataIndex: "referrals",
      key: "referrals",
    },
    {
      title: "Lifestyle recommendations",
      dataIndex: "lifestyleRecommendations",
      key: "lifestyleRecommendations",
    },
    {
      title: "Follow-up plan",
      dataIndex: "followUpPlan",
      key: "followUpPlan",
    },
  ];

  return (
    <div className="overflow-auto max-h-screen p-4">
      {userDetails && (
        <div>
          <p>
            <strong>Patient Name:</strong> {userDetails.name}
          </p>
          <p>
            <strong>Age:</strong> {userDetails.age}
          </p>
          <p>
            <strong>Contact No.:</strong> {userDetails.phone}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {`${userDetails.patientAddress.street}, ${userDetails.patientAddress.barangay}, ${userDetails.patientAddress.city}, ${userDetails.patientAddress.province}`}
          </p>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={patientDetails}
        pagination={false}
        rowKey={(record, index) => index}
        title={() => "Patients Records"}
        bordered
      />
    </div>
  );
}

export default PatientsRecord;
