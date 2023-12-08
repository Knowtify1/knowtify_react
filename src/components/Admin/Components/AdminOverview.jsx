import { Card, Space } from "antd";
import React from "react";
import { QuestionOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
} from "../../../config/firebase.jsx";

async function countDocumentsInCollection(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const numberOfDocuments = querySnapshot.size;
    return numberOfDocuments;
  } catch (error) {
    console.error("Error counting documents:", error);
    return 0;
  }
}

function AdminOverview() {
  const [appointmentsCount, setAppointmentsCount] = useState(null);
  const [patientsCount, setPatientsCount] = useState(null);

  useEffect(() => {
    const fetchAppointmentsCount = async () => {
      const appointmentstotal = await countDocumentsInCollection(
        "appointments"
      );
      const patientsCount = await countDocumentsInCollection("patients");
      setAppointmentsCount(appointmentstotal);
      setPatientsCount(patientsCount);
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
            </Card>
            <Card
              title="Pending"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>null</h1>
            </Card>
            <Card
              title="Proccessed"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>null</h1>
            </Card>
          </Space>
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
      </div>
    </>
  );
}

export default AdminOverview;
