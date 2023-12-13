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
import { Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

function PatientRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthID(user);
        fetchPatientsRecords(user.uid);
      } else {
        setAuthID(null);
        setPatientsRecords([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientsRecords = async (doctorID) => {
    try {
      const q = query(
        collection(db, "patientRecords"),
      );
      const querySnapshot = await getDocs(q);

      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientsRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error.message);
    }
  };

  const columns = [
    {
      title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
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
    // Add more columns based on your patient record structure
  ];

  // Render the component with patient records
  return (
    <div>
      <h2>Patients Records</h2>

      <Table
        dataSource={
          filteredPatients.length > 0 ? filteredPatients : patientsRecords
        }
        columns={columns}
        rowKey="id"
      />
    </div>
  );
}

export default PatientRecords;
