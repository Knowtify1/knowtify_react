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

function AdminOverview() {
  const [approvedAppointmentsCount, setApprovedAppointmentsCount] =
    useState(null);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] =
    useState(null);
  const [assignedAppointmentsCount, setAssignedAppointmentsCount] =
    useState(null);
  const [totalPatientsCount, setTotalPatientsCount] = useState(null); // New state for total patients count

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Count approved appointments from appointments collection
        const approvedAppointmentsQuery = query(
          collection(db, "patients"),
          where("status", "==", "approved")
        );
        const approvedAppointmentsSnapshot = await getDocs(
          approvedAppointmentsQuery
        );
        setApprovedAppointmentsCount(approvedAppointmentsSnapshot.size);

        // Count pending appointments from appointments collection
        const pendingAppointmentsQuery = query(
          collection(db, "appointments"),
          where("status", "==", "pending")
        );
        const pendingAppointmentsSnapshot = await getDocs(
          pendingAppointmentsQuery
        );
        setPendingAppointmentsCount(pendingAppointmentsSnapshot.size);

        // Count assigned appointments from appointments collection
        const assignedAppointmentsQuery = query(
          collection(db, "patients"),
          where("status", "==", "assigned")
        );
        const assignedAppointmentsSnapshot = await getDocs(
          assignedAppointmentsQuery
        );
        setAssignedAppointmentsCount(assignedAppointmentsSnapshot.size);

        // Count total patients for the current date
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );
        const patientsQuery = query(
          collection(db, "patients"),
          where("created_at", ">=", startOfDay),
          where("created_at", "<", endOfDay)
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        setTotalPatientsCount(patientsSnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderProgress = (count, color1, color2) => {
    const percent = (count / 10) * 100; // Assuming max count is 10 for simplicity
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
    const totalAppointments =
      approvedAppointmentsCount +
      pendingAppointmentsCount +
      assignedAppointmentsCount;
    const approvedPercentage =
      (approvedAppointmentsCount / totalAppointments) * 100;
    const pendingPercentage =
      (pendingAppointmentsCount / totalAppointments) * 100;
    const assignedPercentage =
      (assignedAppointmentsCount / totalAppointments) * 100;

    const totalAngle = 360; // Total angle for a full circle
    const depth = 10; // Depth of the 3D effect
    const radius = 45; // Radius of the pie chart
    const centerX = 100; // X coordinate of the center of the circle
    const centerY = 100; // Y coordinate of the center of the circle

    return (
      <svg height="200" width="200">
        {/* Approved Appointments */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#52c41a"
          strokeWidth="90"
          strokeDasharray={`${
            approvedPercentage * (totalAngle / 100)
          } ${totalAngle}`}
          transform={`rotate(-90 ${centerX} ${centerY})`}
        />
        {/* Pending Appointments */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#1890FF"
          strokeWidth="90"
          strokeDasharray={`${
            pendingPercentage * (totalAngle / 100)
          } ${totalAngle}`}
          transform={`rotate(${
            approvedPercentage * (totalAngle / 100) - 90
          } ${centerX} ${centerY})`}
        />
        {/* Assigned Appointments */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#FF4D4F"
          strokeWidth="90"
          strokeDasharray={`${
            assignedPercentage * (totalAngle / 100)
          } ${totalAngle}`}
          transform={`rotate(${
            approvedPercentage * (totalAngle / 100) +
            pendingPercentage * (totalAngle / 100) -
            90
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

  const renderLegend = () => {
    const totalAppointments =
      approvedAppointmentsCount +
      pendingAppointmentsCount +
      assignedAppointmentsCount;
    const approvedPercentage =
      (approvedAppointmentsCount / totalAppointments) * 100;
    const pendingPercentage =
      (pendingAppointmentsCount / totalAppointments) * 100;
    const assignedPercentage =
      (assignedAppointmentsCount / totalAppointments) * 100;

    return (
      <div className="ml-4">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>
            Approved Appointments -{" "}
            {approvedAppointmentsCount !== null
              ? `${approvedAppointmentsCount} (${approvedPercentage.toFixed(
                  1
                )}%)`
              : "Loading..."}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span>
            Pending Appointments -{" "}
            {pendingAppointmentsCount !== null
              ? `${pendingAppointmentsCount} (${pendingPercentage.toFixed(1)}%)`
              : "Loading..."}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>
            Assigned Appointments -{" "}
            {assignedAppointmentsCount !== null
              ? `${assignedAppointmentsCount} (${assignedPercentage.toFixed(
                  1
                )}%)`
              : "Loading..."}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="container mx-auto">
        <div className="flex justify-center">
          <Space direction="horizontal" size={30}>
            <Card
              title={<Title level={4}>Approved Appointments</Title>}
              extra={<a href="../admindashboard/adminappointment">View all</a>}
              style={{
                width: 400,
                backgroundColor: "#E3F4E1",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(
                    approvedAppointmentsCount,
                    "#52c41a",
                    "#1890ff"
                  )}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-green-600">
                    {approvedAppointmentsCount !== null
                      ? approvedAppointmentsCount
                      : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              title={<Title level={4}>Pending Appointments</Title>}
              extra={<a href="../admindashboard/adminappointment">View all</a>}
              style={{
                width: 400,
                backgroundColor: "#E6F7FF",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(
                    pendingAppointmentsCount,
                    "#1890FF",
                    "#FAAD14"
                  )}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-blue-600">
                    {pendingAppointmentsCount !== null
                      ? pendingAppointmentsCount
                      : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card
              title={<Title level={4}>Assigned Appointments</Title>}
              extra={<a href="../admindashboard/adminappointment">View all</a>}
              style={{
                width: 400,
                backgroundColor: "#FFF5F5",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
              hoverable
            >
              <Row justify="space-around" align="middle">
                <Col span={20}>
                  {renderProgress(
                    assignedAppointmentsCount,
                    "#FF4D4F",
                    "#FAAD14"
                  )}
                </Col>
                <Col span={4}>
                  <div className="text-6xl text-red-600">
                    {assignedAppointmentsCount !== null
                      ? assignedAppointmentsCount
                      : "Loading..."}
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
        <div className="mt-8">
          <div className="flex">
            <div className="mr-8">
              <svg height="200" width="200">
                {renderPieChart()}
              </svg>
            </div>
            <div className="mt-10">{renderLegend()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
