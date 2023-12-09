import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, Spin, Space, Button } from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  where,
  query,
  fsTimeStamp,
  deleteDoc,
} from "../../config/firebase.jsx";

function AppointmentSuccess() {
  const location = useLocation();
  const { appointmentID } = location.state;
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const appointmentDoc = doc(
          collection(db, "appointments"),
          appointmentID
        );
        const snapshot = await getDoc(appointmentDoc);

        if (snapshot.exists()) {
          setAppointmentDetails(snapshot.data());
        } else {
          console.error("Appointment not found");
        }
      } catch (error) {
        console.error("Error fetching appointment details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentID]);

  // Now, you can use the appointmentId in your component
  console.log("Appointment ID:", appointmentID);
  return (
    <>
      <div className="book_appointment container mx-auto">
        <div className="relative p-4 justify-center items-center ">
          <Card
            title="Appointment Details"
            style={{ width: "80%"}}
            className="p-8 mb-4"
          >
            {loading ? (
              <Space size="middle">
                <Spin size="large" />
              </Space>
            ) : (
              <>
                <div className="rounded-md bg-gray-500 p-2 flex items-center justify-center">
                  <p className="text-2xl font-bold ">
                    <strong>Reference ID:</strong> {appointmentDetails?.reference}
                  </p>
                </div>
                <div className="mt-4 rounded-md bg-gray-200 p-4 mb-3">
                <div className="rounded-md bg-dark-gray p-2">
                  <p className="text-lg">
                    <strong>Patient Name:</strong> {appointmentDetails?.patientName}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Contact Number:</strong> {appointmentDetails?.contactNo}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Appointment Date:</strong>{" "}
                    {appointmentDetails?.appointmentDate.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Appointment Time:</strong> {appointmentDetails?.appointmentTime}
                  </p>
                </div>
                </div>

                {/* Add other details as needed */}
              </>
            )}
            <div className="mt-6">
              <p className="text-lg mb-2">
                To check the status of your appointment, you can use the reference
                ID. Visit the check appointment page and enter your reference ID
                to get real-time updates.
              </p>
              <Link to="/checkappointment">
                <Button
                  type="primary"
                  className="bg-green-500 hover:bg-green-700"
                >
                  Check Appointment Status
                </Button>
              </Link>
            </div>

            <div className="mt-6">
              <p className="text-lg mb-2">
                Upon a successful appointment, you will receive a confirmation
                receipt. Please present this receipt when you visit the clinic.
              </p>
              {/* Add logic or placeholder for showing the receipt */}
              <Button
                type="primary"
                className="bg-blue-500 hover:bg-blue-700"
                disabled
              >
                View Receipt
              </Button>
              <p className="text-base mb-2 text-rose-600">
                Wait for approval and you will receive your reciept
              </p>
            </div>
          </Card>

          <div className="mt-4 flex justify-center">
            <Link to="/">
              <Button type="primary" className="bg-blue-500 hover:bg-blue-700">
                Go Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
    </>

  );
}

export default AppointmentSuccess;
