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

function DoctorPatientsRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthID(user); // Set the authenticated user's information
        fetchPatientsRecords(user.uid); // Fetch patient records for the authenticated user
      } else {
        setAuthID(null); // No authenticated user
        setPatientsRecords([]); // Clear patient records
      }
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []); // Run this effect only once on component mount

  const fetchPatientsRecords = async (doctorID) => {
    try {
      // Query the Firestore collection for patient records based on the assigned doctor's ID
      const q = query(
        collection(db, "patientRecords"),
        where("assignedDoctorID", "==", doctorID)
      );
      const querySnapshot = await getDocs(q);

      // Use map to transform QuerySnapshot into an array of patient records
      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Set the patient records in the state
      setPatientsRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error.message);
    }
  };

  const columns = [
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
      title: "Previous Diagnoses",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    // Add more columns based on your patient record structure
  ];

  // Render the component with patient records
  return (
    <div>
      <h2>Doctor's Patients Records</h2>

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

export default DoctorPatientsRecords;
