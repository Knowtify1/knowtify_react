import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Card,
  Typography,
  Progress,
  Row,
  Col,
  notification,
  Badge,
} from "antd";
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
  const [totalPatientsCount, setTotalPatientsCount] = useState(null);
  const [consultationCount, setConsultationCount] = useState(null);
  const [followUpCount, setFollowUpCount] = useState(null);
  const [newAppointmentNotification, setNewAppointmentNotification] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const approvedAppointmentsQuery = query(
          collection(db, "patients"),
          where("status", "==", "approved")
        );
        const approvedAppointmentsSnapshot = await getDocs(
          approvedAppointmentsQuery
        );
        setApprovedAppointmentsCount(approvedAppointmentsSnapshot.size);

        const pendingAppointmentsQuery = query(
          collection(db, "appointments"),
          where("status", "==", "pending")
        );
        const pendingAppointmentsSnapshot = await getDocs(
          pendingAppointmentsQuery
        );
        setPendingAppointmentsCount(pendingAppointmentsSnapshot.size);

        const assignedAppointmentsQuery = query(
          collection(db, "patients"),
          where("status", "==", "assigned")
        );
        const assignedAppointmentsSnapshot = await getDocs(
          assignedAppointmentsQuery
        );
        setAssignedAppointmentsCount(assignedAppointmentsSnapshot.size);

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

        const consultationQuery = query(
          collection(db, "appointments"),
          where("reasonForAppointment", "==", "consultation")
        );
        const consultationSnapshot = await getDocs(consultationQuery);
        setConsultationCount(consultationSnapshot.size);

        const followUpQuery = query(
          collection(db, "appointments"),
          where("reasonForAppointment", "==", "follow-up")
        );
        const followUpSnapshot = await getDocs(followUpQuery);
        setFollowUpCount(followUpSnapshot.size);

        const newAppointmentsQuery = query(
          collection(db, "appointments"),
          where("status", "==", "pending")
        );
        const newAppointmentsSnapshot = await getDocs(newAppointmentsQuery);
        if (!newAppointmentsSnapshot.empty) {
          const newlyAddedPendingAppointments =
            newAppointmentsSnapshot.docs.filter((doc) => {
              const data = doc.data();
              const createdAt = data.created_at.toDate();
              return new Date() - createdAt < 60000; // 60,000 milliseconds = 1 minute
            });
          if (newlyAddedPendingAppointments.length > 0) {
            setNewAppointmentNotification(true);
            const notificationKey = "newAppointmentNotification";
            const args = {
              message: "New Appointment",
              description: (
                <div>
                  <p>A new appointment has been added.</p>
                  <p>
                    <a href="../admindashboard/adminappointment">View All</a>
                  </p>
                </div>
              ),
              key: notificationKey,
              onClose: () => {
                setNewAppointmentNotification(false);
                notification.close(notificationKey);
              },
            };
            notification.open(args);
          }
        }
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

  const renderAppointmentPieChart = () => {
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
  const renderAppointmentLegend = () => {
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
      <div className="flex flex-col ml-8">
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

  const renderReasonForAppointmentPieChart = () => {
    const totalReasonForAppointments = consultationCount + followUpCount;
    const consultationPercentage =
      (consultationCount / totalReasonForAppointments) * 100;
    const followUpPercentage =
      (followUpCount / totalReasonForAppointments) * 100;

    const totalAngle = 360; // Total angle for a full circle
    const depth = 10; // Depth of the 3D effect
    const radius = 45; // Radius of the pie chart
    const centerX = 100; // X coordinate of the center of the circle
    const centerY = 100; // Y coordinate of the center of the circle

    return (
      <svg height="200" width="200">
        {/* Consultation Appointments */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#FFC53D"
          strokeWidth="90"
          strokeDasharray={`${
            consultationPercentage * (totalAngle / 100)
          } ${totalAngle}`}
          transform={`rotate(-90 ${centerX} ${centerY})`}
        />
        {/* Follow-up Appointments */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="transparent"
          stroke="#FF4D4F"
          strokeWidth="90"
          strokeDasharray={`${
            followUpPercentage * (totalAngle / 100)
          } ${totalAngle}`}
          transform={`rotate(${
            consultationPercentage * (totalAngle / 100) - 90
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

  const renderReasonForAppointmentLegend = () => {
    const totalReasonForAppointments = consultationCount + followUpCount;
    const consultationPercentage =
      (consultationCount / totalReasonForAppointments) * 100;
    const followUpPercentage =
      (followUpCount / totalReasonForAppointments) * 100;

    return (
      <div className="flex flex-col ml-8">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
          <span>
            Consultation Appointments -{" "}
            {consultationCount !== null
              ? `${consultationCount} (${consultationPercentage.toFixed(1)}%)`
              : "Loading..."}
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>
            Follow-up Appointments -{" "}
            {followUpCount !== null
              ? `${followUpCount} (${followUpPercentage.toFixed(1)}%)`
              : "Loading..."}
          </span>
        </div>
      </div>
    );
  };
  const getCurrentDateMessage = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString(undefined, options);

    return `Today is ${formattedDate}`;
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-center mb-6">
        <h1 className="text-l">{getCurrentDateMessage()}</h1>
      </div>
      <div>
        <div className="flex flex-wrap justify-center">
          <div className="w-full sm:w-1/2 lg:w-1/3 p-4">
            <a href="../admindashboard/adminappointment">
              <Card
                title={<Title level={4}>Approved Appointments</Title>}
                extra={
                  <a href="../admindashboard/adminappointment">View all</a>
                }
                style={{
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
                      {approvedAppointmentsCount !== null ? (
                        <div className="text-6xl text-green-600">
                          {approvedAppointmentsCount}
                        </div>
                      ) : (
                        <div className="text-lg text-green-600">Loading...</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            </a>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/3 p-4">
            <a href="../admindashboard/adminappointment">
              <Card
                title={<Title level={4}>Pending Appointments</Title>}
                extra={
                  <a href="../admindashboard/adminappointment">View all</a>
                }
                style={{
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
                      {pendingAppointmentsCount !== null ? (
                        <div className="text-6xl text-blue-600">
                          {pendingAppointmentsCount}
                        </div>
                      ) : (
                        <div className="text-lg text-blue-600">Loading...</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            </a>
          </div>

          <div className="w-full sm:w-1/2 lg:w-1/3 p-4">
            <a href="../admindashboard/adminappointment">
              <Card
                title={<Title level={4}>Assigned Appointments</Title>}
                extra={
                  <a href="../admindashboard/adminappointment">View all</a>
                }
                style={{
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
                      {assignedAppointmentsCount !== null ? (
                        <div className="text-6xl text-red-600">
                          {assignedAppointmentsCount}
                        </div>
                      ) : (
                        <div className="text-lg text-red-600">Loading...</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            </a>
          </div>
        </div>
        <div className="mt-4 ml-20 flex justify-center">
          <div>
            <svg height="200" width="200">
              {renderAppointmentPieChart()}
            </svg>
          </div>
          <div>
            <div className="flex justify-center">
              {renderAppointmentLegend()}
            </div>
          </div>
          <div>
            <svg height="200" width="200">
              {renderReasonForAppointmentPieChart()}
            </svg>
          </div>
          <div>
            <div className="flex justify-center">
              {renderReasonForAppointmentLegend()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
