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

function AdminOverview() {
  const [appointmentsCount, setAppointmentsCount] = useState(null);
  const [approvedPatientsCount, setApprovedPatientsCount] = useState(null);
  const [assignedPatientsCount, setAssignedPatientsCount] = useState(null);

  useEffect(() => {
    const fetchAppointmentsCount = async () => {
      try {
        const appointmentsTotal = await countDocumentsInCollection(
          "appointments"
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
    <>
      <div className="">
        <Space direction="vertical" size={20}>
          <h1 className="text-center text-3xl font-medium">Overview</h1>
          <Space direction="horizontal" size={16} className="flex-wrap">
            <Card
              title="Appointments"
              extra={<a href="../admindashboard/adminappointment">View all</a>}
              style={{ width: 300 }}
            >
              <Space direction="horizontal">
                <h1>
                  {appointmentsCount !== null
                    ? appointmentsCount
                    : "Loading..."}
                </h1>
                <span>Appointments</span>
              </Space>
              <Space direction="horizontal">
                <h1>
                  {approvedPatientsCount !== null
                    ? approvedPatientsCount
                    : "Loading..."}
                </h1>
                <span>Approved Patients</span>
              </Space>
              <Space direction="horizontal">
                <h1>
                  {assignedPatientsCount !== null
                    ? assignedPatientsCount
                    : "Loading..."}
                </h1>
                <span>Assigned Patients</span>
              </Space>
            </Card>
            <Card
              title="Schedule"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>null</h1>
            </Card>
            <Card
              title="Patient Record"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>null</h1>
            </Card>
            <Space direction="horizontal" size={16} className="flex-wrap">
              <Card
                style={{
                  width: 300,
                }}
              >
                <Space direction="horizontal" size={10}>
                  <QuestionOutlined />
                  <h1>Number of Patients</h1>
                </Space>
              </Card>
              <Card
                style={{
                  width: 300,
                }}
              >
                <Space direction="horizontal" size={10}>
                  <QuestionOutlined />
                  <h1>Schedule ni Doc</h1>
                </Space>
              </Card>
              <Card
                style={{
                  width: 300,
                }}
              >
                <Space direction="horizontal" size={10}>
                  <QuestionOutlined />
                  <h1>Profile Update</h1>
                </Space>
              </Card>
            </Space>
          </Space>
        </Space>
      </div>
    </>
  );
}

export default AdminOverview;
