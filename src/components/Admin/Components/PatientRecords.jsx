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
import { Table, Input, Select, Collapse } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Panel } = Collapse;

function PatientRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [groupedPatients, setGroupedPatients] = useState({}); // Define groupedPatients state

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

  // Group records by assigned doctor and then by patient name
  useEffect(() => {
    const tempGroupedPatients = {};
    filteredPatients.forEach((record) => {
      const doctor = record.assignedDoctor;
      const patientName = record.patientName;
      if (!tempGroupedPatients[doctor]) {
        tempGroupedPatients[doctor] = {};
      }
      if (!tempGroupedPatients[doctor][patientName]) {
        tempGroupedPatients[doctor][patientName] = [];
      }
      // Check if the record already exists in the group based on reference ID
      const existingRecord = tempGroupedPatients[doctor][patientName].find(
        (r) => r.reference === record.reference
      );
      if (!existingRecord) {
        tempGroupedPatients[doctor][patientName].push(record);
      }
    });
    setGroupedPatients(tempGroupedPatients);
  }, [filteredPatients]);

  // Render the component with patient records
  return (
    <div
      style={{
        position: "relative",
        height: "calc(100vh - 100px)", // Adjust the height as needed
        overflow: "auto",
        padding: "0 20px", // Add padding to prevent content from touching edges
      }}
    >
      <h2>Patients Records</h2>

      <Input.Search
        placeholder="Search Patient Name"
        enterButton={<SearchOutlined style={{ color: "blue" }} />}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginBottom: 16 }}
        // Make the search icon visible
        allowClear
        visibility="visible"
      />

      <Collapse
        accordion
        style={{
          width: "100%", // Adjust the width as needed
          marginBottom: 20, // Adjust the margin as needed
          minHeight: "60vh", // Adjust the minimum height to prevent collapse size from being too small
          overflowX: "auto", // Make the Collapse scrollable horizontally
          backgroundColor: "#fff", // Set background color to white
        }}
      >
        {Object.entries(groupedPatients).map(([doctor, patients], index) => (
          <Panel
            header={
              <span style={{ color: "green", fontSize: "18px" }}>
                Doctor: {doctor}
              </span>
            }
            key={index}
          >
            <Collapse accordion>
              {Object.entries(patients).map(
                ([patientName, records], patientIndex) => (
                  <Panel
                    header={
                      <strong>
                        {searchText.trim() !== "" &&
                        patientName
                          .toLowerCase()
                          .includes(searchText.toLowerCase())
                          ? patientName
                              .split(new RegExp(`(${searchText})`, "gi"))
                              .map((part, index) =>
                                part.toLowerCase() ===
                                searchText.toLowerCase() ? (
                                  <span
                                    key={index}
                                    style={{ backgroundColor: "yellow" }}
                                  >
                                    {part}
                                  </span>
                                ) : (
                                  <span key={index}>{part}</span>
                                )
                              )
                          : patientName}
                      </strong>
                    }
                    key={patientIndex}
                  >
                    <p>
                      <strong>Family History:</strong>{" "}
                      {records[0].patientFamilyHistory}
                    </p>
                    <p>
                      <strong>History:</strong> {records[0].patientHistory}
                    </p>
                    <p>
                      <strong>Allergies:</strong> {records[0].patientAllergies}
                    </p>
                    <Table
                      dataSource={records}
                      columns={[
                        {
                          title: "Appointment Date",
                          dataIndex: "appointmentDate",
                          key: "appointmentDate",
                          render: (text, record) =>
                            moment(record.appointmentDate.toDate()).format(
                              "MMMM D, YYYY"
                            ),
                        },
                        {
                          title: "Reason",
                          dataIndex: "reasonForAppointment",
                          key: "reasonForAppointment",
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
                      ]}
                      pagination={false}
                      style={{ minWidth: "100%" }}
                      rowClassName={() => "white-background-row"}
                    />
                  </Panel>
                )
              )}
            </Collapse>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}

export default PatientRecords;
