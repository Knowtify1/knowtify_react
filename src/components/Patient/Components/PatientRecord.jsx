import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import { Table } from "antd";

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const q = query(
          collection(db, "patients"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserDetails(userData);
          const referenceId = userData.referenceId;
          fetchPatientDetails(referenceId);
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

const fetchPatientDetails = async (reference) => {
  try {
    const patientsCollection = collection(db, "patients"); // Collection for patients
    const patientQuery = query(
      patientsCollection,
      where("reference", "==", reference)
    );
    const patientQuerySnapshot = await getDocs(patientQuery);

    if (!patientQuerySnapshot.empty) {
      const patientData = patientQuerySnapshot.docs[0].data();
      setPatientDetails(patientData);
    } else {
      // If patient not found in patients collection, try fetching from patientRecords collection
      const patientRecordsCollection = collection(db, "patientRecords");
      const patientRecordsQuery = query(
        patientRecordsCollection,
        where("reference", "==", reference)
      );
      const patientRecordsSnapshot = await getDocs(patientRecordsQuery);

      if (!patientRecordsSnapshot.empty) {
        const patientData = patientRecordsSnapshot.docs[0].data();
        setPatientDetails(patientData);
      } else {
        console.error("No patient data found in patientRecords collection.");
      }
    }
  } catch (error) {
    console.error("Error fetching patient details:", error.message);
  }
};



  const columns = [
    {
      title: "Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Assigned Doctor",
      dataIndex: "assignedDoctor",
      key: "assignedDoctor",
    },
    {
      title: "Medical History",
      dataIndex: "medicalHistory",
      key: "medicalHistory",
    },
    {
      title: "Previous Diagnoses",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    {
      title: "Medications Prescribed Previously",
      dataIndex: "medicationsPrescribed",
      key: "medicationsPrescribed",
    },
    {
      title: "Allergies",
      dataIndex: "allergies",
      key: "allergies",
    },
    {
      title: "Previous Surgeries or Treatments",
      dataIndex: "surgeriesTreatment",
      key: "surgeriesTreatment",
    },
    {
      title: "Family Medical History",
      dataIndex: "familyMedicalHistory",
      key: "familyMedicalHistory",
    },
    // Add more columns as needed based on user details structure
  ];

  return (
    <div className="overflow-auto max-h-screen p-4">
      <h2>Patient Details</h2>

      {patientDetails && (
        <Table
          dataSource={[patientDetails]} // Pass patientDetails as an array with single element
          columns={columns}
          rowKey={(record) => record.uid} // Assuming uid is unique
        />
      )}
    </div>
  );
}

export default PatientsRecord;
