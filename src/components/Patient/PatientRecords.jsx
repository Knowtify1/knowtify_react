import React, { useEffect, useState } from "react";
import { Card, Table, Input, Button, Form } from "antd";
import {
  auth,
  db,
  collection,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
} from "../../config/firebase.jsx";
import PatientsRecord from "./Components/PatientRecord";

const { TextArea } = Input;

function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [patientHistory, setPatientHistory] = useState("");
  const [patientFamilyHistory, setPatientFamilyHistory] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Fetch existing patient data for the user if it exists
        const q = query(
          collection(db, "patients"),
          query(collection(db, "patients"), where("patientName", "==", name))
        );
        const querySnapshot = await getDoc(q);
        if (querySnapshot.exists()) {
          const patientData = querySnapshot.data();
          setPatients([patientData]); // Set patients state with existing data
        }
        setName(user.displayName); // Set name state with user's display name
      }
    };
    fetchData();
  }, []);

  const onFinish = async () => {
    const user = auth.currentUser;
    if (user) {
      const patientData = {
        patientName: name,
        patientHistory,
        patientFamilyHistory,
        patientAllergies,
        userId: user.uid, // Include userId
      };

      try {
        // Check if the user already has existing patient data
        const existingPatient = patients.find(
          (patient) => patient.patientName === name
        );
        if (existingPatient) {
          // Update existing document
          await updateDoc(
            collection(db, "patients"),
            existingPatient.id,
            patientData
          );
          setPatients([
            ...patients.filter((patient) => patient.patientName !== name),
            patientData,
          ]);
        } else {
          // Add new document
          const docRef = await addDoc(collection(db, "patients"), patientData);
          setPatients([...patients, { id: docRef.id, ...patientData }]);
        }

        // Clear form fields after submission
        setPatientHistory("");
        setPatientFamilyHistory("");
        setPatientAllergies("");
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Patient History",
      dataIndex: "patientHistory",
      key: "patientHistory",
    },
    {
      title: "Patient Family History",
      dataIndex: "patientFamilyHistory",
      key: "patientFamilyHistory",
    },
    {
      title: "Patient Allergies",
      dataIndex: "patientAllergies",
      key: "patientAllergies",
    },
  ];

  return (
    <>
      <div className="container mx-auto p-2">
        <div className="flex flex-col gap-0">
          <div className="w-full text-center">
            <h3
              className="text-3xl font-semibold pt-5"
              style={{ color: "#333" }}
            >
              Patient Records
            </h3>{" "}
          </div>
          <Card
            title={<div className="w-full text-center"></div>}
            className="overflow-auto max-h-screen p-4" // Set a maximum height and padding
          >
            <PatientsRecord />
          </Card>
          <Card
            className="overflow-auto max-h-screen p-4" // Set a maximum height and padding
          >
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item label="Name">
                <span>{name}</span> {/* Display name as text */}
              </Form.Item>
              <Form.Item label="Patient History" name="patientHistory">
                <TextArea
                  value={patientHistory}
                  onChange={(e) => setPatientHistory(e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="Patient Family History"
                name="patientFamilyHistory"
              >
                <TextArea
                  value={patientFamilyHistory}
                  onChange={(e) => setPatientFamilyHistory(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Patient Allergies" name="patientAllergies">
                <TextArea
                  value={patientAllergies}
                  onChange={(e) => setPatientAllergies(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Form.Item>
            </Form>
            <Table dataSource={patients} columns={columns} />
          </Card>
        </div>
      </div>
    </>
  );
}

export default PatientRecords;
