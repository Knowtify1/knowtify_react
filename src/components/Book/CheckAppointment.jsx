import React, { useState } from "react";
import { Form, Input, Button, Card, Space, Spin, Modal } from "antd";
import { Link } from "react-router-dom";
import html2pdf from "html2pdf.js";
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
  updateDoc,
} from "../../config/firebase.jsx";

function DoctorAppointment() {
  const [loading, setLoading] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = async (values) => {
    const referenceID = values.referenceID;
    setLoading(true);

    try {
      const appointmentsCollection = collection(db, "appointments");
      const patientsCollection = collection(db, "patients");

      // Query appointments collection
      const appointmentsQuery = query(
        appointmentsCollection,
        where("reference", "==", referenceID)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      // Query patients collection
      const patientsQuery = query(
        patientsCollection,
        where("reference", "==", referenceID)
      );
      const patientsSnapshot = await getDocs(patientsQuery);

      console.log("Appointments Snapshot Size:", appointmentsSnapshot.size);
      console.log("Patients Snapshot Size:", patientsSnapshot.size);

      let appointmentData = null;
      let patientData = null;

      // Check if the appointment exists
      if (appointmentsSnapshot.size > 0) {
        appointmentData = appointmentsSnapshot.docs[0].data();
      }

      // Check if the patient exists
      if (patientsSnapshot.size > 0) {
        patientData = patientsSnapshot.docs[0].data();
      }

      console.log("Appointment Data:", appointmentData);
      console.log("Patient Data:", patientData);

      if (appointmentData || patientData) {
        // Data found in either "appointments" or "patients" collection
        setAppointmentData(appointmentData || patientData);

        if (appointmentData) {
          // Appointment found in "appointments" collection
          const appointmentStatus = appointmentData.status;

          console.log("appointmentStatus:", appointmentStatus);

          if (appointmentStatus === "pending") {
            setAppointmentStatus("Appointment is pending approval");
            setReceipt(null);
          } else if (appointmentStatus === "approved") {
            setAppointmentStatus("Appointment is approved");
            setReceipt(appointmentData.receipt);
            showModal();
          } else {
            setAppointmentStatus("Unknown status");
            setReceipt(null);
          }

          // Access additional patient data if needed
          console.log("Fetched Appointment Data:", appointmentData);
        } else if (patientData) {
          // No appointment found, but patient found in "patients" collection
          const patientStatus = patientData.status;

          console.log("patientStatus:", patientStatus);

          if (patientStatus === "pending") {
            setAppointmentStatus("Appointment is pending approval");
            setReceipt(null);
          } else if (patientStatus === "approved") {
            setAppointmentStatus("Appointment is approved");
            // Set receipt or other relevant information from patient data
            setReceipt(patientData.receipt);
            showModal();
          } else {
            setAppointmentStatus("Unknown status");
            setReceipt(null);
          }

          // Access additional patient data if needed
          console.log("Fetched Patient Data:", patientData);
        }
      } else {
        // No appointment or patient found with the provided reference ID
        setAppointmentStatus(
          "No appointment or patient found with the provided reference ID"
        );
        setReceipt(null);
      }
    } catch (error) {
      console.error("Error checking appointment status", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const element = document.getElementById("appointmentDetails");

    if (element) {
      const pdfOptions = {
        margin: 10,
        filename: "appointment_details.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf(element, pdfOptions);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen">
        <Card
          title="Check Appointment Status"
          style={{ width: 400 }}
          className="p-8"
        >
          <Form
            name="checkAppointmentStatus"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Reference ID"
              name="referenceID"
              rules={[
                {
                  required: true,
                  message: "Please enter your appointment reference ID!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-700"
              >
                Check Status
              </Button>
            </Form.Item>
          </Form>

          {loading && (
            <Space size="middle" className="mt-4">
              <Spin size="large" />
            </Space>
          )}

          {appointmentStatus && !loading && (
            <div className="mt-4">
              <p>Status: {appointmentStatus}</p>
            </div>
          )}
        </Card>

        <Modal
          title="Appointment Details"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button
              key="print"
              type="primary"
              onClick={handlePrint}
              className="bg-blue-500 hover:bg-blue-700"
            >
              Print / Download PDF
            </Button>,
            <Button
              key="cancel"
              onClick={handleCancel}
              className="bg-blue-500 hover:bg-blue-700"
            >
              Close
            </Button>,
          ]}
        >
          {receipt && (
            <div>
              <p>Receipt: {receipt}</p>
              {/* Add other details from the receipt */}
            </div>
          )}

          {/* Additional patient details */}
          {appointmentStatus === "Appointment is approved" && (
            <div id="appointmentDetails">
              <p>
                <strong>Patient Name:</strong> {appointmentData?.patientName}
              </p>
              <p>
                <strong>Contact Number:</strong> {appointmentData?.contactNo}
              </p>
              <p>
                <strong>Appointment Date:</strong>{" "}
                {appointmentData?.appointmentDate
                  ?.toDate()
                  .toLocaleDateString()}
              </p>
              <p>
                <strong>Appointment Time:</strong>{" "}
                {appointmentData?.appointmentTime}
              </p>
              <p>
                <strong>Patient Address:</strong>{" "}
                {appointmentData?.patientAddress}
              </p>
              <p>
                <strong>Reason for Appointment:</strong>{" "}
                {appointmentData?.reasonForAppointment}
              </p>
              <p>
                <strong>Type of Doctor:</strong> {appointmentData?.typeOfDoctor}
              </p>
              <p>
                <strong>Status:</strong> {appointmentData?.status}
              </p>
            </div>
          )}
        </Modal>

        <div className="mt-4">
          <Link to="/">
            <Button type="primary" className="bg-blue-500 hover:bg-blue-700">
              Go Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default DoctorAppointment;
