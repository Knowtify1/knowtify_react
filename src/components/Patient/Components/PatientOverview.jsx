import { Card, Space } from "antd";
import React, { useState, useEffect } from "react";
import { QuestionOutlined } from "@ant-design/icons";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
} from "../../../config/firebase.jsx";

async function countDocumentsInCollection(
  collectionName,
  filterField,
  filterValue
) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const filteredDocs = querySnapshot.docs.filter(
      (doc) => doc.data()[filterField] === filterValue
    );
    const numberOfDocuments = filteredDocs.length;
    return numberOfDocuments;
  } catch (error) {
    console.error("Error counting documents:", error);
    return 0;
  }
}

function generateGraph(count, lineColor) {
  const batteryWidth = 150; // Width of the battery container
  const batteryHeight = 40; // Height of the battery container
  const batteryPadding = 5; // Padding between battery and graph lines
  const lineSpacing = 2; // Spacing between graph lines

  // Calculate width of each line based on the count
  const lineWidth =
    (batteryWidth - 2 * batteryPadding - (count - 1) * lineSpacing) / count;

  const lines = [];
  for (let i = 0; i < count; i++) {
    lines.push(
      <div
        key={i}
        style={{
          width: lineWidth,
          height: "100%",
          backgroundColor: lineColor,
          marginRight: i === count - 1 ? 0 : lineSpacing,
        }}
      ></div>
    );
  }

  return (
    <div
      style={{
        width: batteryWidth,
        height: batteryHeight,
        border: "1px solid #000",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {lines}
    </div>
  );
}

function PatientOverview() {
  const [appointmentsCount, setAppointmentsCount] = useState(null);
  const [approvedPatientsCount, setApprovedPatientsCount] = useState(null);
  const [assignedPatientsCount, setAssignedPatientsCount] = useState(null);

  useEffect(() => {
    const fetchAppointmentsCount = async () => {
      try {
        const appointmentsTotal = await countDocumentsInCollection(
          "appointments",
          "patientRecords",
          "patients"
        );

        // Count patients with status === "approved"
        const approvedCount = await countDocumentsInCollection(
          "patients",
          "status",
          "approved"
        );
        setApprovedPatientsCount(approvedCount);

        // Count patients with status === "assigned"
        const assignedCount = await countDocumentsInCollection(
          "patients",
          "status",
          "assigned"
        );
        setAssignedPatientsCount(assignedCount);

        setAppointmentsCount(appointmentsTotal);
      } catch (error) {
        console.error("Error fetching appointments count:", error);
      }
    };

    fetchAppointmentsCount();
  }, []);

  return (
    <div className="flex justify-center">
      <Space direction="horizontal" size={20}>
        <Card
          title="Appointments"
          extra={<a href="../patientdashboard/patientappointment">View all</a>}
          style={{ width: 400, backgroundColor: "#E4F1FE" }}
        >
          <Space direction="horizontal">
            <h1>
              {appointmentsCount !== null ? appointmentsCount : "Loading..."}
            </h1>
            <span>Appointments</span>
          </Space>
          <div style={{ marginTop: "10px" }}>
            {generateGraph(appointmentsCount, "#054d94")}
          </div>
        </Card>
        <Card
          title="Approved Patients"
          extra={<a href="../patientdashboard/patientappointment">View all</a>}
          style={{ width: 400, backgroundColor: "#DFF0DF" }}
        >
          <Space direction="horizontal">
            <h1>
              {approvedPatientsCount !== null
                ? approvedPatientsCount
                : "Loading..."}
            </h1>
            <span>Approved</span>
          </Space>
          <div style={{ marginTop: "10px" }}>
            {generateGraph(approvedPatientsCount, "#316831")}
          </div>
        </Card>
        <Card
          title="Assigned Patients"
          extra={<a href="../patientdashboard/patientappointment">View all</a>}
          style={{ width: 400, backgroundColor: "#FFE4E1" }}
        >
          <Space direction="horizontal">
            <h1>
              {assignedPatientsCount !== null
                ? assignedPatientsCount
                : "Loading..."}
            </h1>
            <span>Assigned</span>
          </Space>
          <div style={{ marginTop: "10px" }}>
            {generateGraph(assignedPatientsCount, "#990f00")}
          </div>
        </Card>
      </Space>
    </div>
  );
}

export default PatientOverview;
