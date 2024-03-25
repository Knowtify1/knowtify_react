import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Card, Space, Typography, Progress, Row, Col } from "antd";
import { db } from "../../../config/firebase.jsx";
import { auth } from "../../../config/firebase.jsx";
import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  ScheduleTwoTone,
} from "@ant-design/icons";

const { Title } = Typography;

function DoctorOverview() {
  const [assignedPatientsCount, setAssignedPatientsCount] = useState(null);
  const [followUpCount, setFollowUpCount] = useState(null);
  const [consultationCount, setConsultationCount] = useState(null);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            const doctorDocRef = doc(db, "doctors_accounts", user.uid);
            const doctorSnapshot = await getDoc(doctorDocRef);

            if (doctorSnapshot.exists()) {
              const patientsQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", doctorSnapshot.id)
              );
              const patientsSnapshot = await getDocs(patientsQuery);
              setAssignedPatientsCount(patientsSnapshot.size);

              const followUpQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", doctorSnapshot.id),
                where("reasonForAppointment", "==", "follow-up")
              );
              const followUpSnapshot = await getDocs(followUpQuery);
              setFollowUpCount(followUpSnapshot.size);

              const consultationQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", doctorSnapshot.id),
                where("reasonForAppointment", "==", "consultation")
              );
              const consultationSnapshot = await getDocs(consultationQuery);
              setConsultationCount(consultationSnapshot.size);
            } else {
              console.log("Doctor document does not exist");
            }
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTotalAppointmentsCount = async () => {
      try {
        const totalAppointmentsQuery = query(collection(db, "patients"));
        const totalAppointmentsSnapshot = await getDocs(totalAppointmentsQuery);
        setTotalAppointmentsCount(totalAppointmentsSnapshot.size);
      } catch (error) {
        console.error("Error fetching total appointments count:", error);
      }
    };

    fetchTotalAppointmentsCount();
  }, []);

  const renderProgress = (count, color1, color2) => {
    const percent = (count / totalAppointmentsCount) * 100;
    return (
      <Progress
        percent={percent}
        strokeWidth={18}
        strokeColor={{
          "0%": color1,
          "100%": color2,
        }}
        showInfo={false}
      />
    );
  };

  const renderPieChart = () => {
    const totalPatients =
      followUpCount + consultationCount + assignedPatientsCount;
    const totalAngle = 360; // Total angle for a full circle
    const depth = 10; // Depth of the 3D effect
    const radius = 45; // Radius of the pie chart
    const centerX = 100; // X coordinate of the center of the circle
    const centerY = 100; // Y coordinate of the center of the circle

    // Calculate percentages for each category
    const followUpPercentage = (followUpCount / totalPatients) * totalAngle;
    const consultationPercentage =
      (consultationCount / totalPatients) * totalAngle;
    const assignedPercentage =
      (assignedPatientsCount / totalPatients) * totalAngle;

    return (
      <svg height="200" width="200">
        {/* Follow-up Patients */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#297846"
          strokeWidth="90"
          strokeDasharray={`${followUpPercentage} ${totalAngle}`}
          transform={`rotate(-90 ${centerX} ${centerY})`}
        />
        {/* Consultation Patients */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#EEEB3C"
          strokeWidth="90"
          strokeDasharray={`${consultationPercentage} ${totalAngle}`}
          transform={`rotate(${followUpPercentage - 90} ${centerX} ${centerY})`}
        />
        {/* Assigned Patients */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#FF4D4F"
          strokeWidth="90"
          strokeDasharray={`${assignedPercentage} ${totalAngle}`}
          transform={`rotate(${
            followUpPercentage + consultationPercentage - 90
          } ${centerX} ${centerY})`}
        />
        {/* Inner circle for depth effect */}
        <circle cx={centerX} cy={centerY} r={radius - depth} fill="#fff" />
        {/* Outer circle for depth effect */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + depth}
          fill="#000"
          opacity="0.2"
        />
      </svg>
    );
  };

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex justify-center">
          <Space direction="horizontal" size={30}>
            <Card
              title={<Title level={4}>Assigned Patients</Title>}
              extra={
                <a href="../doctordashboard/doctorappointment">View all</a>
              }
              style={{
                width: 400,
                backgroundColor: "#FFF5F5",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(assignedPatientsCount, "#FF4D4F", "#FAAD14")}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-red-600">
                    {assignedPatientsCount !== null
                      ? assignedPatientsCount
                      : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              title={<Title level={4}>Follow-up Patients</Title>}
              extra={
                <a href="../doctordashboard/doctorappointment">View all</a>
              }
              style={{
                width: 400,
                backgroundColor: "#BAFFC7",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(followUpCount, "#297846", "#3AF27D")}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-green-600">
                    {followUpCount !== null ? followUpCount : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              title={<Title level={4}>Consultation Patients</Title>}
              extra={
                <a href="../doctordashboard/doctorappointment">View all</a>
              }
              style={{
                width: 400,
                backgroundColor: "#FCF4BD",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(consultationCount, "#7C722C", "#F2DA3A")}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-yellow-600">
                    {consultationCount !== null
                      ? consultationCount
                      : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
        <div className="mt-8">
          <div className="flex">
            {/* Pie Chart rendering */}
            <div className="mr-8">{renderPieChart()}</div>
            <div className="mt-10">
              <div className="ml-4">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>
                    Assigned Patients -{" "}
                    {assignedPatientsCount !== null
                      ? `${assignedPatientsCount} (${(
                          (assignedPatientsCount / totalAppointmentsCount) *
                          100
                        ).toFixed(1)}%)`
                      : "Loading..."}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>
                    Follow-up Patients -{" "}
                    {followUpCount !== null
                      ? `${followUpCount} (${(
                          (followUpCount / totalAppointmentsCount) *
                          100
                        ).toFixed(1)}%)`
                      : "Loading..."}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>
                    Consultation Patients -{" "}
                    {consultationCount !== null
                      ? `${consultationCount} (${(
                          (consultationCount / totalAppointmentsCount) *
                          100
                        ).toFixed(1)}%)`
                      : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorOverview;
