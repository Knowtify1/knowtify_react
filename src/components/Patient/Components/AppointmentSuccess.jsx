import React, { useEffect, useState } from "react";
import { Card, Spin, Space, Button, Input, Form } from "antd";
import { getDocs, collection, query, where } from "../../config/firebase.jsx";

const { Search } = Input;

function AppointmentSuccess() {
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const reference = values.reference;
      const appointmentSnapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("reference", "==", reference)
        )
      );
      if (appointmentSnapshot.empty) {
        console.error("No appointment found with the provided reference.");
        setAppointmentDetails(null);
      } else {
        const appointmentData = appointmentSnapshot.docs[0].data();
        setAppointmentDetails(appointmentData);
      }
    } catch (error) {
      console.error("Error fetching appointment details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="book_appointment container mx-auto">
        <div className="relative p-4 justify-center items-center ">
          <Card
            title="Appointment Details"
            style={{ width: "80%" }}
            className="p-8 mb-4"
          >
            <Form
              onFinish={onFinish}
              initialValues={{ reference: "" }}
              layout="vertical"
            >
              <Form.Item
                label="Enter Your Reference ID"
                name="reference"
                rules={[
                  { required: true, message: "Please enter your reference ID" },
                ]}
              >
                <Search
                  placeholder="Reference ID"
                  enterButton="Search"
                  loading={loading}
                  onSearch={onFinish}
                />
              </Form.Item>
            </Form>
            {loading ? (
              <Space size="middle">
                <Spin size="large" />
              </Space>
            ) : (
              <>
                {appointmentDetails ? (
                  <>
                    <div className="rounded-md bg-gray-500 p-2 flex items-center justify-center">
                      <p className="text-2xl font-bold">
                        <strong>Reference ID:</strong>{" "}
                        {appointmentDetails.reference}
                      </p>
                    </div>
                    <div className="mt-4 rounded-md bg-gray-200 p-4 mb-3">
                      <div className="rounded-md bg-dark-gray p-2">
                        <p className="text-lg">
                          <strong>Patient Name:</strong>{" "}
                          {appointmentDetails.patientName}
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-gray p-2 mt-1">
                        <p className="text-lg">
                          <strong>Contact Number:</strong>{" "}
                          {appointmentDetails.contactNo}
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-gray p-2 mt-1">
                        <p className="text-lg">
                          <strong>Appointment Date:</strong>{" "}
                          {appointmentDetails.appointmentDate
                            ?.toDate()
                            .toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-md bg-dark-gray p-2 mt-1">
                        <p className="text-lg">
                          <strong>Appointment Time:</strong>{" "}
                          {appointmentDetails.appointmentTime}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>No appointment found with the provided reference.</p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export default AppointmentSuccess;
