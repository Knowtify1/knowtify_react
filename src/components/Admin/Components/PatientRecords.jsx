import React, { useState } from "react";
import { Form, Input, Button, Card, Space, Spin } from "antd";


function PatientRecords() {
  const [loading, setLoading] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);

  const onFinish = async (values) => {
    const referenceID = values.referenceID;
    setLoading(true);

    try {
      const patientRef = doc(db, "patients", referenceID);
      const docSnapshot = await getDoc(patientRef);

      if (docSnapshot.exists()) {
        const patientData = docSnapshot.data();
        setPatientDetails(patientData);
      } else {
        console.log("No patient found with the provided reference ID.");
        setPatientDetails(null);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        <Card
          title="Get Patient Details"
          style={{ width: 400 }}
          className="p-8"
        >
          <Form
            name="getPatientDetails"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Patient Reference ID"
              name="referenceID"
              rules={[
                {
                  required: true,
                  message: "Please enter the patient reference ID!",
                },
              ]}
            >
              <Input />
                      </Form.Item>
                      
                      <Form
            name="checkAppointmentStatus"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          ></Form>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-700"
              >
                Get Patient Details
              </Button>
            </Form.Item>
          </Form>

          {loading && (
            <Space size="middle" className="mt-4">
              <Spin size="large" />
            </Space>
          )}

          {patientDetails && !loading && (
            <div className="mt-4">
              <h2>Patient Details</h2>
              <p>Name: {patientDetails.patientName}</p>
              <p>Contact Number: {patientDetails.contactNo}</p>
              <p>Appointment Date: {patientDetails.appointmentDate?.toDate().toLocaleDateString()}</p>
              {/* Add other patient details as needed */}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

export default PatientRecords;
