import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, Button, Form, Input, Spin } from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  fsTimeStamp,
} from "../../config/firebase.jsx";
import { handleSendCode, handleVerifyCode } from "../../config/signinphone.jsx";
import { HomeOutlined } from "@ant-design/icons";
import moment from "moment";

function AppointmentSuccess() {
  const location = useLocation();
  const { appointmentData } = location.state;
  const { phone } = location.state;
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [PatientAuthID, setPatientAuthID] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationInitiated, setVerificationInitiated] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);

  useEffect(() => {
    if (phone && !codeSent) {
      handleSendCode(phone, setConfirmationResult, setCodeSent);
    }
  }, [phone, codeSent]);

  useEffect(() => {
    if (verificationCode.length === 6 && !verificationInitiated) {
      setVerifying(true);
      handleVerifyCode(confirmationResult, verificationCode, setPatientAuthID)
        .then(() => {
          saveAppointment();
          setVerificationInitiated(true);
        })
        .finally(() => setVerifying(false));
    }
  }, [verificationCode, verificationInitiated]);

  const saveAppointment = async () => {
    if (!creatingAppointment) {
      setCreatingAppointment(true);
      const myDoc = collection(db, "appointments");
      try {
        const docref = await addDoc(myDoc, appointmentData);
        console.log("appointment ID: " + docref.id);
      } catch (error) {
        console.error("Error saving appointment:", error);
      } finally {
        setCreatingAppointment(false);
      }
    }
  };

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
      age: appointmentData.age,
      patientAddress: appointmentData.patientAddress,
      dateofregistration: dateofregistration,
    };
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
      console.error("Error creating user accounts record:", error);
    }
    setShowAppointmentDetails(true);
  };
  const addAmOrPmLabel = (time) => {
    const appointmentTime = moment(time, "h:mm A");
    if (
      appointmentTime.isBetween(
        moment("7:00 AM", "h:mm A"),
        moment("11:59 AM", "h:mm A")
      )
    ) {
      return "AM";
    } else if (
      appointmentTime.isBetween(
        moment("12:00 PM", "h:mm A"),
        moment("6:00 PM", "h:mm A")
      )
    ) {
      return "PM";
    } else {
      return ""; // Default case, no label
    }
  };

  return (
    <>
      {showAppointmentDetails ? (
        <div className="book_appointment container mx-auto">
          <div className="relative p-4 justify-center items-center ">
            <Card
              title="Appointment Details"
              style={{ width: "99%" }}
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
                    {moment(
                      appointmentData.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("h:mm")}{" "}
                    {moment(
                      appointmentData.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("HH:mm") >= "07:00" &&
                    moment(
                      appointmentData.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("HH:mm") < "12:00"
                      ? "AM"
                      : "PM"}
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
              <div className="mt-4">
                <p className="text-lg mb-2">or Login to your account.</p>
                <Link to="/patientdashboard">
                  <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-700"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card
          title={
            <div>
              <Link to="/" className=" top-3 left-80">
                <Button type="link" icon={<HomeOutlined />} />
              </Link>
              Verify Phone
            </div>
          }
          bordered={true}
          style={{ width: 400 }}
          className="drop-shadow-md mt-20"
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
                <div style={{ color: "red", marginTop: "5px" }}>
                  {codeSent
                    ? "Verification code sent."
                    : "Wait for the verification code to be sent."}
                </div>
              </Form.Item>
            </Form>

            <div id="recaptcha-container" style={{ display: "none" }}>
              {/* Your reCAPTCHA component */}
            </div>
            <Button
              type="primary"
              className="bg-green-600 w-full"
              onClick={createPatientCollection}
              disabled={!codeSent || !verificationCode}
            >
              Register
            </Button>
            {verifying && <Spin />}
          </div>
        </Card>
      )}
    </>
  );
}

export default AppointmentSuccess;
