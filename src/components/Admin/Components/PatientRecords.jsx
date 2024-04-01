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
import { Table, Input, Card, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

function PatientRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

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

      let records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort records by patientName
      records.sort((a, b) => a.patientName.localeCompare(b.patientName));

      // Extract unique assigned doctors
      const doctors = [
        ...new Set(records.map((record) => record.assignedDoctor)),
      ];
      setAssignedDoctors(doctors);

      setPatientsRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error.message);
    }
  };

  useEffect(() => {
    // Filter records based on search text
    const filtered = patientsRecords.filter((record) =>
      record.patientName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchText, patientsRecords]);

  const handleDoctorChange = (value) => {
    setSelectedDoctor(value);
    if (value) {
      const filtered = patientsRecords.filter(
        (record) => record.assignedDoctor === value
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
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
      render: (text) => {
        const index = text.toLowerCase().indexOf(searchText.toLowerCase());
        if (index > -1) {
          const beforeStr = text.substr(0, index);
          const afterStr = text.substr(index + searchText.length);
          return (
            <span>
              {beforeStr}
              <span style={{ backgroundColor: "#ffc069" }}>
                {text.substr(index, searchText.length)}
              </span>
              {afterStr}
            </span>
          );
        }
        return text;
      },
    },
    {
      title: "Reason",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
  ];

  const expandedRowRender = (record) => {
    return (
      <div>
        <Card>
          <p>
            <strong>Allergies:</strong> {record.patientAllergies}
          </p>
          <p>
            <strong>Family History:</strong> {record.patientFamilyHistory}
          </p>
          <p>
            <strong>History:</strong> {record.patientHistory}
          </p>
          <p>
            <strong>Diagnosis:</strong> {record.previousDiagnoses}
          </p>
          <p>
            <strong>Investigations ordered (labs, imaging, etc.):</strong>{" "}
            {record.investigationsOrdered}
          </p>
          <p>
            <strong>Treatment plan:</strong> {record.treatmentPlan}
          </p>
          <p>
            <strong>Medications prescribed:</strong>{" "}
            {record.medicationsPrescribed}
          </p>
          <p>
            <strong>Referrals (if any):</strong> {record.referrals}
          </p>
          <p>
            <strong>Lifestyle recommendations:</strong>{" "}
            {record.lifestyleRecommendations}
          </p>
          <p>
            <strong>Follow-up plan:</strong> {record.followUpPlan}
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

      <Input.Search
        placeholder="Search Patient Name"
        enterButton={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginBottom: 16 }}
      />

      {assignedDoctors.map((doctor, index) => (
        <div key={index}>
          <h3>{doctor}</h3>
          <Table
            dataSource={filteredPatients.filter(
              (record) => record.assignedDoctor === doctor
            )}
            columns={columns}
            expandable={{ expandedRowRender }}
            rowKey="id"
          />
        </div>
      ))}
    </div>
  );
}

export default PatientRecords;
