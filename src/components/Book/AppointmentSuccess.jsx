import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, Spin, Space, Button, Form, Input } from "antd";
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
  auth,
} from "../../config/firebase.jsx";
import { handleSendCode, handleVerifyCode } from "../../config/signinphone.jsx";
function AppointmentSuccess() {
  const location = useLocation();
  const { appointmentData } = location.state;
  const { phone } = location.state;
  const [appointmentID, setAppointmentID] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [PatientAuthID, setPatientAuthID] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [register, setregister] = useState(false);
  const onSendCode = () => {
    handleSendCode(phoneNumber, setConfirmationResult, setCodeSent);
  };
  const onVerifyCode = async () => {
    setVerifying(true);
    handleVerifyCode(confirmationResult, verificationCode, setPatientAuthID);
    if (confirmationResult) {
      saveAppointment();
      setVerifying(false);
      setregister(true);
    } else {
      setShowAppointmentDetails(false);
    }
  };
  useEffect(() => {
    setPhoneNumber(phone);
  }, [phone]);
  const saveAppointment = async () => {
    const myDoc = collection(db, "appointments");
    try {
      const docref = await addDoc(myDoc, appointmentData);
      setAppointmentID(docref.id);
      console.log("appointment ID: " + docref.id);
      console.log(appointmentID);
    } catch (error) {
      console.log(error);
    }
  };
  // const fetchAppointmentDetails = async () => {
  //   try {
  //     const appointmentDoc = doc(collection(db, "appointments"), appointmentID);
  //     const snapshot = await getDoc(appointmentDoc);
  //     if (snapshot.exists()) {
  //       setAppointmentDetails(snapshot.data());
  //       console.error("Appointment found");
  //     } else {
  //       console.error("Appointment not found");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching appointment details", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const createPatientCollection = async () => {
    console.log("ID: " + PatientAuthID);
    const dateofregistration = fsTimeStamp.now();
    const patientData = {
      name: appointmentData.patientName,
      uid: PatientAuthID,
      password: "",
      type: "patient",
      referenceId: appointmentData.reference,
      phone: phone,
      age: appointmentData.age, // Assuming age is part of appointmentData
      patientAddress: appointmentData.patientAddress,
      dateofregistration: dateofregistration,
    };
    console.log("patientData: " + patientData);
    const patientsCollection = collection(db, "patient_accounts");
    const patientsDocRef = doc(patientsCollection, `${PatientAuthID}`);
    try {
      await setDoc(patientsDocRef, patientData);
      console.log("patient_accounts: firestore success");
    } catch (error) {
      console.error("Error creating patient collection:", error);
    }
    const users_accounts = collection(db, "users_accounts_records");
    const users_accountsDocRef = doc(users_accounts, `${PatientAuthID}`);
    try {
      await setDoc(users_accountsDocRef, patientData);
      console.log("users_accounts_records: firestore success");
    } catch (error) {
      console.log(error);
    }
    setShowAppointmentDetails(true);
  };
  return (
    <>
      {showAppointmentDetails ? (
        <div className="book_appointment container mx-auto">
          <div className="relative p-4 justify-center items-center ">
            <Card
              title="Appointment Details"
              style={{ width: "80%" }}
              className="p-8 mb-4"
            >
              <div className="rounded-md bg-gray-500 p-2 flex items-center justify-center">
                <p className="text-2xl font-bold ">
                  <strong>Reference ID:</strong> {appointmentData.reference}
                </p>
              </div>
              <div className="mt-4 rounded-md bg-gray-200 p-4 mb-3">
                <div className="rounded-md bg-dark-gray p-2">
                  <p className="text-lg">
                    <strong>Patient Name:</strong> {appointmentData.patientName}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Contact Number:</strong> {appointmentData.contactNo}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Appointment Date:</strong>{" "}
                    {String(appointmentData.appointmentDate)}
                  </p>
                </div>
                <div className="rounded-md bg-dark-gray p-2 mt-1">
                  <p className="text-lg">
                    <strong>Appointment Time:</strong>{" "}
                    {appointmentData.appointmentTime.replace(/"/g, "")}{" "}
                    {/* Display the appointment time with label */}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-lg mb-2">
                  To check the status of your appointment, you can use the
                  reference ID. Visit the check appointment page and enter your
                  reference ID to get real-time updates.
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
              {/* <div className="mt-6">
            <p className="text-lg mb-2">
              Upon a successful appointment, you will receive a confirmation
              receipt. Please present this receipt when you visit the
              clinic.
            </p>
            <Button
              type="primary"
              className="bg-blue-500 hover:bg-blue-700"
              disabled
            >
              View Receipt
            </Button>
            <p className="text-base mb-2 text-rose-600">
              Wait for approval and you will receive your receipt
            </p>
          </div> */}
            </Card>
            <div className="mt-4 flex justify-center">
              <Link to="/patientdashboard">
                <Button
                  type="primary"
                  className="bg-blue-500 hover:bg-blue-700"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <Card
          title="Verify Phone"
          bordered={true}
          style={{ width: 350 }}
          className="drop-shadow-md mt-20"
          headStyle={{ textAlign: "center" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1 style={{ marginBottom: "20px" }}>Phone: {phone}</h1>
            <Form>
              <Form.Item
                label="Verification Code"
                name="verificationCode"
                rules={[
                  {
                    required: true,
                    message: "Please input the verification code!",
                  },
                ]}
              >
                <Input
                  disabled={!codeSent}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  className="bg-green-600 w-full"
                  style={{ marginBottom: "10px" }}
                  onClick={onSendCode}
                  disabled={!phoneNumber || codeSent}
                >
                  Send Code
                </Button>
                <Spin spinning={verifying}>
                  <Button
                    type="primary"
                    className="bg-green-600 w-full"
                    style={{ marginBottom: "10px" }}
                    onClick={onVerifyCode}
                    disabled={!verificationCode}
                  >
                    Verify Code
                  </Button>
                </Spin>
                <Button
                  type="primary"
                  className="bg-green-600 w-full"
                  onClick={createPatientCollection}
                  disabled={!register}
                >
                  Register
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      )}
    </>
  );
}
export default AppointmentSuccess;
