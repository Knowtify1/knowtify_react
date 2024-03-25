import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Typography, Form, Input, Button, Row, Col } from "antd";
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
        <Row gutter={[4, 4]} justify="center">
          <Col span={10}>
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
                    {patientEMRData.appointmentTime.replace(/"/g, "")}
                  </p>
                  <p>
                    <strong>Reason:</strong>{" "}
                    {patientEMRData.reasonForAppointment}
                  </p>
                </div>
              ) : (
                <p>No Data</p>
              )}
            </Card>
          </Col>
          <Col span={14}>
            <Card title="Medical Information">
              <Form
                name="medicalInformationForm"
                onFinish={onFinish}
                className="space-y-4"
              >
                <Form.Item name="previousDiagnoses" label="Diagnosis">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  name="investigationsOrdered"
                  label="Investigations ordered (labs, imaging, etc.)"
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="treatmentPlan" label="Treatment plan">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  name="medicationsPrescribed"
                  label="Medications prescribed"
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="referrals" label="Referrals (if any)">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item
                  name="lifestyleRecommendations"
                  label="Lifestyle recommendations"
                >
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="followUpPlan" label="Follow-up plan">
                  <Input.TextArea />
                </Form.Item>
                <Form.Item className="flex justify-center">
                  <Button type="success" onClick={onCancel} className="mr-4">
                    Cancel
                  </Button>
                  <Button type="success" htmlType="submit">
                    Save
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default DoctorEMRForms;
