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

function DoctorOverView() {
  useEffect(() => {
    const fetchAppointmentsCount = async () => {};

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
                <h1></h1>
                <span>1</span>
              </Space>
              <Space direction="horizontal">
                <h1></h1>
                <span>2</span>
              </Space>
              <Space direction="horizontal">
                <h1></h1>
                <span>3</span>
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

export default DoctorOverView;
