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
import moment from "moment";
import { Table, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

function PatientRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchCriteria, setSearchCriteria] = useState("patientName"); // Default search criteria
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [groupedPatients, setGroupedPatients] = useState({});

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

      records.sort((a, b) => a.patientName.localeCompare(b.patientName));

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
    const filtered = patientsRecords.filter((record) => {
      const lowerSearchText = searchText.toLowerCase();
      switch (searchCriteria) {
        case "patientName":
          return record.patientName.toLowerCase().includes(lowerSearchText);
        case "typeOfDoctor":
          return record.typeOfDoctor.toLowerCase().includes(lowerSearchText);
        case "age":
          return record.age.toLowerCase().includes(lowerSearchText);
        // Add additional cases for other search criteria
        default:
          return false;
      }
    });
    setFilteredPatients(filtered);
  }, [searchText, patientsRecords, searchCriteria]);

  useEffect(() => {
    if (selectedDoctor) {
      const filtered = patientsRecords.filter(
        (record) => record.assignedDoctor === selectedDoctor
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patientsRecords);
    }
  }, [selectedDoctor, patientsRecords]);

  const handleDoctorChange = (value) => {
    setSelectedDoctor(value);
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      sorter: (a, b) => a.patientName.localeCompare(b.patientName),
    },
    {
      title: "Type of Doctor",
      dataIndex: "typeOfDoctor",
    },
    {
      title: "Reason for Appointment",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    {
      title: "Patient Allergies",
      dataIndex: "patientAllergies",
      key: "patientAllergies",
    },
    {
      title: "Patient Family History",
      dataIndex: "patientFamilyHistory",
      key: "patientFamilyHistory",
    },
    {
      title: "Diagnosis",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    {
      title: "Investigations Ordered",
      dataIndex: "investigationsOrdered",
      key: "investigationsOrdered",
    },
    {
      title: "Treatment Plan",
      dataIndex: "treatmentPlan",
      key: "treatmentPlan",
    },
    {
      title: "Medications Prescribed",
      dataIndex: "medicationsPrescribed",
      key: "medicationsPrescribed",
    },
    {
      title: "Referrals",
      dataIndex: "referrals",
      key: "referrals",
    },
    {
      title: "Lifestyle Recommendations",
      dataIndex: "lifestyleRecommendations",
      key: "lifestyleRecommendations",
    },
    {
      title: "Follow-up Plan",
      dataIndex: "followUpPlan",
      key: "followUpPlan",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        height: "calc(100vh - 100px)",
        overflow: "auto",
        padding: "0 20px",
      }}
    >
      <h2>Patients Records</h2>

      <Input.Search
        placeholder="Search"
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginBottom: 16 }}
        allowClear
      />

      <Select
        placeholder="Select Doctor"
        style={{ width: 200, marginBottom: 16 }}
        onChange={handleDoctorChange}
        value={selectedDoctor}
      >
        <Option value="">All Doctors</Option>
        {assignedDoctors.map((doctor) => (
          <Option key={doctor} value={doctor}>
            {doctor}
          </Option>
        ))}
      </Select>

      <Table
        dataSource={filteredPatients}
        columns={columns}
        pagination={{ pageSize: 10 }}
        rowKey="id"
      />
    </div>
  );
}

export default PatientRecords;
