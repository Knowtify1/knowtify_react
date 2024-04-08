import React, { useEffect, useState } from "react";
import { Input, Button, Table, Space, Modal } from "antd";
import {
  auth,
  db,
  collection,
  updateDoc,
  query,
  where,
  getDocs,
} from "../../config/firebase.jsx";
import { onAuthStateChanged } from "firebase/auth";
import PatientsRecord from "./Components/PatientRecord";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"; // Importing icons

const { TextArea } = Input;

function PatientRecords() {
  const [userDetails, setUserDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [patientHistory, setPatientHistory] = useState("");
  const [patientFamilyHistory, setPatientFamilyHistory] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("");
  const [savedPatientData, setSavedPatientData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false); // State for controlling the visibility of patient information

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "users_accounts_records"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserDetails(userData);
            setName(userData.name);
            fetchPatientDetails(userData.name);
          } else {
            console.error("No user data found in patient collection.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      } else {
        setUserDetails(null);
        setPatients([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (name) => {
    try {
      const patientsQuery = query(
        collection(db, "patients"),
        where("patientName", "==", name)
      );
      const patientRecordsQuery = query(
        collection(db, "patientRecords"),
        where("patientName", "==", name)
      );

      const [patientsSnapshot, patientRecordsSnapshot] = await Promise.all([
        getDocs(patientsQuery),
        getDocs(patientRecordsQuery),
      ]);

      const fetchedPatients = [];
      patientsSnapshot.forEach((doc) => {
        fetchedPatients.push({ id: doc.id, ...doc.data() });
      });
      patientRecordsSnapshot.forEach((doc) => {
        fetchedPatients.push({ id: doc.id, ...doc.data() });
      });

      setPatients(fetchedPatients);
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const handleHistoryChange = (e) => {
    const { value } = e.target;
    setPatientHistory(value);
  };

  const handleFamilyHistoryChange = (e) => {
    const { value } = e.target;
    setPatientFamilyHistory(value);
  };

  const handleAllergiesChange = (e) => {
    const { value } = e.target;
    setPatientAllergies(value);
  };

  const onFinish = async () => {
    if (userDetails) {
      const patientData = {
        patientHistory,
        patientFamilyHistory,
        patientAllergies,
        userId: userDetails.uid,
      };

      try {
        // Update each document with the new patient data in the patients collection
        const patientsQuery = query(
          collection(db, "patients"),
          where("patientName", "==", name)
        );
        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsUpdatePromises = patientsSnapshot.docs.map(
          async (doc) => {
            await updateDoc(doc.ref, patientData);
          }
        );
        await Promise.all(patientsUpdatePromises);

        // Update each document with the new patient data in the patientRecords collection
        const patientRecordsQuery = query(
          collection(db, "patientRecords"),
          where("patientName", "==", name)
        );
        const patientRecordsSnapshot = await getDocs(patientRecordsQuery);
        const patientRecordsUpdatePromises = patientRecordsSnapshot.docs.map(
          async (doc) => {
            await updateDoc(doc.ref, patientData);
          }
        );
        await Promise.all(patientRecordsUpdatePromises);

        // Fetch updated patient records to reflect changes
        fetchPatientDetails(name);

        // Set the saved patient data to display
        setSavedPatientData(patientData);

        // Clear input fields after saving
        setPatientHistory("");
        setPatientFamilyHistory("");
        setPatientAllergies("");
      } catch (error) {
        console.error("Error updating documents: ", error);
      }
    }
  };

  const handleEdit = (patient) => {
    setPatientHistory(patient.patientHistory);
    setPatientFamilyHistory(patient.patientFamilyHistory);
    setPatientAllergies(patient.patientAllergies);
  };

  const columns = [
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
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Edit</Button>
        </Space>
      ),
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
          <br></br>
          <div className="container mx-auto p-4">
            {userDetails && (
              <div>
                <p>
                  <strong>Patient Name:</strong> {userDetails.name}
                </p>
                <p>
                  <strong>Age:</strong> {userDetails.age}
                </p>
                <p>
                  <strong>Contact No.:</strong> {userDetails.phone}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {`${userDetails.patientAddress.street}, ${userDetails.patientAddress.barangay}, ${userDetails.patientAddress.city}, ${userDetails.patientAddress.province}`}
                </p>
              </div>
            )}
          </div>

          <div className="container mx-auto p-2">
            <h4>
              <Button
                type="link"
                icon={showPatientInfo ? <MinusOutlined /> : <PlusOutlined />} // Changing icon based on showPatientInfo state
                onClick={() => setShowPatientInfo(!showPatientInfo)}
              >
                {showPatientInfo ? "Hide" : "Add"} Your Medical History
              </Button>
            </h4>
            {showPatientInfo && (
              <div className="table-container" style={{ overflowX: "auto" }}>
                <Input placeholder="Name" value={name} disabled />
                <TextArea
                  placeholder="Patient History"
                  value={patientHistory}
                  onChange={handleHistoryChange}
                />
                <TextArea
                  placeholder="Patient Family History"
                  value={patientFamilyHistory}
                  onChange={handleFamilyHistoryChange}
                />
                <TextArea
                  placeholder="Patient Allergies"
                  value={patientAllergies}
                  onChange={handleAllergiesChange}
                />
                <Button type="success" onClick={onFinish}>
                  Save
                </Button>
                <Table
                  dataSource={patients.slice(0, 1)}
                  columns={columns}
                  scroll={{ x: true }}
                />
              </div>
            )}
          </div>
          <PatientsRecord patients={patients} handleEdit={handleEdit} />
        </div>
      </div>
    </>
  );
}

export default PatientRecords;
