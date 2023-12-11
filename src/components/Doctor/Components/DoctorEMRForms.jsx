import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  notification,
} from "antd";
import moment from "moment";
import {
  auth,
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from "../../../config/firebase.jsx";

const { Text } = Typography;

function DoctorEMRForms() {
  const location = useLocation();
  const { patientEMRData } = location.state || {};
  const navigate = useNavigate();

  const deletePatientData = async (patientId) => {
    try {
      const patientDocRef = doc(db, "patients", patientId);
      await deleteDoc(patientDocRef);

      console.log("Patient data deleted successfully");
      navigate("../doctorpatientrecord");
    } catch (error) {
      console.error("Error deleting patient data:", error.message);
    }
  };

  const onFinish = async (values) => {
    try {
      const emrCollectionRef = collection(db, "patientRecords");

      const sanitizedValues = Object.fromEntries(
        Object.entries({ ...patientEMRData, ...values }).map(([key, value]) => [
          key,
          value === undefined ? "" : value,
        ])
      );

      const newEmrDocRef = await addDoc(emrCollectionRef, sanitizedValues);

      console.log("New document added with ID:", newEmrDocRef.id);

      await deletePatientData(patientEMRData.patientID);

      notification.success({
        message: "Success",
        description: "Medical information saved successfully.",
      });
    } catch (error) {
      console.error("Error saving data:", error.message);

      notification.error({
        message: "Error",
        description: "Failed to save medical information. Please try again.",
      });
    }
  };

  const onCancel = () => {
    navigate("../doctorpatientrecord");
  };

  return (
    <>
      <div>
        <Card title="Patient Details">
          {patientEMRData ? (
            <div>
              <p>
                <strong>Patient Name:</strong> {patientEMRData.patientName}
              </p>
              <p>
                <strong>Age:</strong> {patientEMRData.age}
              </p>
              <p>
                <strong>Contact Number:</strong> {patientEMRData.contactNo}
              </p>
              <p>
                <strong>Appointment Date:</strong>{" "}
                {moment(patientEMRData.appointmentDate.toDate()).format(
                  "MMMM D, YYYY"
                )}
              </p>
              <p>
                <strong>Appointment Time:</strong>{" "}
                {patientEMRData.appointmentTime}
              </p>
              <p>
                <strong>Reason:</strong> {patientEMRData.reasonForAppointment}
              </p>
            </div>
          ) : (
            <p>No Data</p>
          )}
        </Card>
        <Card title="Medical Information">
          <Form name="medicalInformationForm" onFinish={onFinish}>
            <Form.Item name="medicalHistory" label="Medical History">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="previousDiagnoses" label="Previous Diagnoses">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="medicationsPrescribed"
              label="Medications Prescribed Previously"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="allergies" label="Allergies">
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="surgeriesTreatments"
              label="Previous Surgeries or Treatments"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="familyMedicalHistory"
              label="Family Medical History"
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="appointmentRecords" label="Appointment Records">
              <Input.TextArea />
            </Form.Item>

            <Form.Item>
              <Space direction="horizontal" size={10}>
                <Button
                  type="primary"
                  onClick={onCancel}
                  style={{ marginLeft: 8 }}
                  className="bg-blue-500 hover:bg-blue-700 text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
}

export default DoctorEMRForms;
