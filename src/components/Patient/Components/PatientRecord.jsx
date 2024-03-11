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
import { Table, Typography, Button, Input, message, Space } from "antd";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [editableRows, setEditableRows] = useState({});
  const [editedData, setEditedData] = useState({});
  const [editSaved, setEditSaved] = useState(false);

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
            const name = userData.name;
            fetchPatientDetails(name);
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

  const fetchPatientDetails = async (name) => {
    try {
      const patientsCollection = collection(db, "patientRecords");
      const patientQuery = query(
        patientsCollection,
        where("patientName", "==", name)
      );
      const patientQuerySnapshot = await getDocs(patientQuery);

      if (!patientQuerySnapshot.empty) {
        const patientData = patientQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPatientDetails(patientData);
        const initialEditableRows = {};
        const initialEditedData = {};
        patientData.forEach((_, index) => {
          initialEditableRows[index] = false; // Set all rows as not editable initially
          initialEditedData[index] = { ...patientData[index] };
        });
        setEditableRows(initialEditableRows);
        setEditedData(initialEditedData);
      } else {
        console.error("No patient data found for the given name.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        Object.keys(editedData).map(async (index) => {
          const { id, ...data } = editedData[index];
          const patientRef = doc(db, "patientRecords", id);
          await updateDoc(patientRef, data);
        })
      );
      setEditSaved(true);
      setTimeout(() => {
        setEditSaved(false);
      }, 3000);
      console.log("Patient details saved successfully.");
    } catch (error) {
      console.error("Error updating patient details:", error.message);
    }
  };

  const handleCellChange = (value, field, index) => {
    const updatedEditedData = { ...editedData };
    updatedEditedData[index] = {
      ...editedData[index],
      [field]: value,
    };
    setEditedData(updatedEditedData);
  };

  const handleEditClick = (index) => {
    const updatedEditableRows = { ...editableRows };
    updatedEditableRows[index] = true; // Enable editing for this row
    setEditableRows(updatedEditableRows);
  };

  const handleCancelEdit = (index) => {
    const updatedEditableRows = { ...editableRows };
    updatedEditableRows[index] = false; // Disable editing for this row
    setEditableRows(updatedEditableRows);

    // Reset edited data to original data
    const updatedEditedData = { ...editedData };
    updatedEditedData[index] = { ...patientDetails[index] };
    setEditedData(updatedEditedData);
  };

  const columns = [
    {
      title: "Specialty Doctor",
      dataIndex: "typeOfDoctor",
      key: "typeOfDoctor",
    },
    {
      title: "Medical History",
      dataIndex: "medicalHistory",
      key: "medicalHistory",
      render: (text, record, index) =>
        editableRows[index] ? (
          <Input.TextArea
            rows={4}
            value={editedData[index]?.medicalHistory || text}
            onChange={(e) =>
              handleCellChange(e.target.value, "medicalHistory", index)
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Family Medical History",
      dataIndex: "familyMedicalHistory",
      key: "familyMedicalHistory",
      render: (text, record, index) =>
        editableRows[index] ? (
          <Input.TextArea
            rows={4}
            value={editedData[index]?.familyMedicalHistory || text}
            onChange={(e) =>
              handleCellChange(e.target.value, "familyMedicalHistory", index)
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Allergies",
      dataIndex: "allergies",
      key: "allergies",
      render: (text, record, index) =>
        editableRows[index] ? (
          <Input.TextArea
            rows={4}
            value={editedData[index]?.allergies || text}
            onChange={(e) =>
              handleCellChange(e.target.value, "allergies", index)
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Previous Diagnoses",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
    },
    {
      title: "Surgeries or Treatments",
      dataIndex: "surgeriesTreatments",
      key: "surgeriesTreatments",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record, index) => (
        <Space>
          {editableRows[index] ? (
            <>
              <Button type="success" onClick={() => handleSave(index)}>
                Save
              </Button>
              <Button onClick={() => handleCancelEdit(index)}>
                <CloseOutlined /> Cancel
              </Button>
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditClick(index)}
            >
              Edit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (editSaved) {
      message.success("Edit saved successfully");
    }
  }, [editSaved]);

  return (
    <div className="overflow-auto max-h-screen p-4">
      <Table
        columns={columns}
        dataSource={patientDetails}
        pagination={false}
        rowKey={(record, index) => index}
        title={() => "Patients Records"}
        bordered
      />
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={() => window.location.reload()}>Refresh Page</Button>
    </div>
  );
}

export default PatientsRecord;
