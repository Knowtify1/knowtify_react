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
import { Table, Input, Card } from "antd";
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
      const q = query(collection(db, "patientRecords"));
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
  ];

  const expandedRowRender = (record) => {
    return (
      <div>
        <Card>
          <p>
            <strong>Medical History:</strong> {record.medicalHistory}
          </p>
          <p>
            <strong>Previous Diagnoses:</strong> {record.previousDiagnoses}
          </p>
          <p>
            <strong>Medications Prescribed Previously:</strong>{" "}
            {record.medicationsPrescribed}
          </p>
          <p>
            <strong>Allergies:</strong> {record.allergies}
          </p>
          <p>
            <strong>Previous Surgeries or Treatments:</strong>{" "}
            {record.surgeriesTreatment}
          </p>
          <p>
            <strong>Family Medical History:</strong>{" "}
            {record.familyMedicalHistory}
          </p>
          {/* Add more fields if needed */}
        </Card>
      </div>
    );
  };

  // Render the component with patient records
  return (
    <div
      style={{
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
      }}
    >
      <h2>Patients Records</h2>

      <Table
        dataSource={
          filteredPatients.length > 0 ? filteredPatients : patientsRecords
        }
        columns={columns}
        expandable={{ expandedRowRender }}
        rowKey="id"
      />
    </div>
  );
}

export default PatientRecords;
