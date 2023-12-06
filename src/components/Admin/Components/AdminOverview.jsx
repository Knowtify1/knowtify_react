import { Card, Space } from "antd";
import React from "react";
import { QuestionOutlined } from "@ant-design/icons";

function AdminOverview() {
  return (
    <>
      <div className="">
        <Space direction="vertical" size={20}>
          <h1 className="text-center text-3xl font-medium">Overview</h1>
          <Space direction="horizontal" size={16} className="flex-wrap">
            <Card
              title="Appointments"
              extra={<a href="appointment">View all</a>}
              style={{ width: 300 }}
            >
              <h1>1 Patients</h1>
            </Card>
            <Card
              title="Pending"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>2 Patients</h1>
            </Card>
            <Card
              title="Proccessed"
              extra={<a href="">View all</a>}
              style={{ width: 300 }}
            >
              <h1>3 Patients</h1>
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
