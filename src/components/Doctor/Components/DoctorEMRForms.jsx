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
    navigate("../doctorappointment");
  };

  const formatDate = (date) => {
    if (date && date.toDate) {
      const options = { month: "long", day: "numeric", year: "numeric" };
      return date.toDate().toLocaleDateString(undefined, options);
    }
    return "";
  };

  return (
    <>
      <div>
        <Row gutter={[8, 8]} justify="center">
          <Col span={24}>
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
                  {formatDate(patientEMRData.appointmentDate)}
                </p>
                <p>
                  <strong>Appointment Time:</strong>{" "}
                  {patientEMRData.appointmentTime.replace(/"/g, "")}
                </p>
              </div>
            ) : (
              <p>No Data</p>
            )}
            <Form
              name="medicalInformationForm"
              onFinish={onFinish}
              layout="vertical"
            >
              <Row>
                <Col span={12}>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Form.Item
                        label="Allergies:"
                        name="patientAllergies"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Family History:"
                        name="patientFamilyHistory"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Diagnosis:"
                        name="previousDiagnoses"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Treatment plan:"
                        name="treatmentPlan"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row gutter={[8, 8]}>
                    <Col span={24}>
                      <Form.Item
                        label="Prescriptions:"
                        name="medicationsPrescribed"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Investigations order (labs, imaging, etc.):"
                        name="investigationsOrdered"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Referrals (if any):"
                        name="referrals"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Lifestyle recommendations:"
                        name="lifestyleRecommendations"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label="Follow-up plan:"
                        name="followUpPlan"
                        style={{ marginBottom: 0 }}
                        labelCol={{ span: 16 }}
                        wrapperCol={{ span: 22 }}
                      >
                        <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row justify="center">
                <Col>
                  <br></br>
                  <Form.Item>
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "green",
                        borderColor: "green",
                      }}
                      htmlType="submit"
                      className="mr-4"
                    >
                      Save
                    </Button>
                    <Button
                      type="primary"
                      style={{ backgroundColor: "gray" }}
                      onClick={onCancel}
                      className="mr-4"
                    >
                      Cancel
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default DoctorEMRForms;
