import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "../../../config/firebase.jsx";
import { Card, Row, Col, Typography, Table, Input, Button } from "antd";
import {
  MedicineBoxOutlined,
  HistoryOutlined,
  HeartOutlined,
  AlertOutlined,
  ScissorOutlined,
  FileTextOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [editableFields, setEditableFields] = useState({
    medicalHistory: false,
    familyMedicalHistory: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "patient_accounts"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserDetails(userData);
            const referenceId = userData.referenceId;
            fetchPatientDetails(referenceId);
          } else {
            console.error("No user data found in patient collection.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      } else {
        setUserDetails(null);
        setPatientDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (reference) => {
    try {
      const patientsCollection = collection(db, "patients");
      const patientQuery = query(
        patientsCollection,
        where("reference", "==", reference)
      );
      const patientQuerySnapshot = await getDocs(patientQuery);

      if (!patientQuerySnapshot.empty) {
        const patientData = patientQuerySnapshot.docs[0].data();
        setPatientDetails(patientData);
      } else {
        const patientRecordsCollection = collection(db, "patientRecords");
        const patientRecordsQuery = query(
          patientRecordsCollection,
          where("reference", "==", reference)
        );
        const patientRecordsSnapshot = await getDocs(patientRecordsQuery);

        if (!patientRecordsSnapshot.empty) {
          const patientData = patientRecordsSnapshot.docs[0].data();
          setPatientDetails(patientData);
        } else {
          console.error("No patient data found in patientRecords collection.");
        }
      }
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const handleSave = async () => {
    try {
      const patientRef = doc(db, "patients", patientDetails.id);
      await updateDoc(patientRef, patientDetails);
    } catch (error) {
      console.error("Error updating patient details:", error.message);
    }
  };

  const handleFieldChange = (key, value) => {
    setPatientDetails((prevPatientDetails) => ({
      ...prevPatientDetails,
      [key]: value,
    }));
  };

  const PatientCard = ({ icon, label, value }) => (
    <Card
      style={{ marginBottom: 16 }}
      bodyStyle={{ textAlign: "left", color: "red" }}
    >
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <div style={{ fontSize: "24px" }}>{icon}</div>
      </div>
      <Title level={5} style={{ marginBottom: "10px", textAlign: "center" }}>
        {label}
      </Title>
      <Text>{value}</Text>
    </Card>
  );

  const columns = [
    {
      title: "Medical History",
      dataIndex: "medicalHistory",
      key: "medicalHistory",
      render: (text, record) =>
        editableFields.medicalHistory ? (
          <Input.TextArea
            value={text}
            onChange={(e) =>
              handleFieldChange("medicalHistory", e.target.value)
            }
            autoSize={{ minRows: 9, maxRows: 10 }}
          />
        ) : (
          <>
            {text}
            <EditOutlined
              style={{ marginLeft: 8 }}
              onClick={() =>
                setEditableFields({ ...editableFields, medicalHistory: true })
              }
            />
          </>
        ),
    },
    {
      title: "Previous Diagnoses",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    {
      title: "Previous Surgeries or Treatments",
      dataIndex: "surgeriesTreatment",
      key: "surgeriesTreatment",
    },
    {
      title: "Family Medical History",
      dataIndex: "familyMedicalHistory",
      key: "familyMedicalHistory",
      render: (text, record) =>
        editableFields.familyMedicalHistory ? (
          <Input.TextArea
            value={text}
            onChange={(e) =>
              handleFieldChange("familyMedicalHistory", e.target.value)
            }
            autoSize={{ minRows: 9, maxRows: 10 }}
          />
        ) : (
          <>
            {text}
            <EditOutlined
              style={{ marginLeft: 8 }}
              onClick={() =>
                setEditableFields({
                  ...editableFields,
                  familyMedicalHistory: true,
                })
              }
            />
          </>
        ),
    },
  ];

  const data = patientDetails
    ? [
        {
          key: "1",
          medicalHistory: patientDetails.medicalHistory || "-",
          previousDiagnoses: patientDetails.previousDiagnoses || "-",
          surgeriesTreatment: patientDetails.surgeriesTreatment || "-",
          familyMedicalHistory: patientDetails.familyMedicalHistory || "-",
        },
      ]
    : [];

  return (
    <div className="overflow-auto max-h-screen p-4">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={3}>Patient Details</Title>
          <Text>Name: {patientDetails?.patientName}</Text>
          <br />
          <Text>Age: {patientDetails?.age}</Text>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <PatientCard
            icon={<MedicineBoxOutlined />}
            label="Prescriptions"
            value={patientDetails?.medicationsPrescribed || "-"}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <PatientCard
            icon={<AlertOutlined />}
            label="Allergies"
            value={patientDetails?.allergies || "-"}
          />
        </Col>
        {data.length > 0 && (
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            size="middle"
            style={{ marginBottom: 16 }}
          />
        )}
        <Button onClick={handleSave}>Save</Button>
      </Row>
    </div>
  );
}

export default PatientsRecord;
