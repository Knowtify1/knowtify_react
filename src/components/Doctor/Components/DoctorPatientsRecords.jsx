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
import { Collapse, Input, Space, Button } from "antd";
import { SaveOutlined, EditOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

function DoctorPatientsRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [editingKey, setEditingKey] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthID(user);
        fetchPatientsRecords(user.uid);
      } else {
        setAuthID(null);
        setPatientsRecords([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientsRecords = async (doctorID) => {
    try {
      const q = query(
        collection(db, "patientRecords"),
        where("assignedDoctorID", "==", doctorID)
      );
      const querySnapshot = await getDocs(q);

      const records = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientsRecords(records);
    } catch (error) {
      console.error("Error fetching patient records:", error.message);
    }
  };

  const handleInputChange = (e, key, dataIndex) => {
    const updatedRecords = patientsRecords.map((record) => {
      if (record.id === key) {
        return { ...record, [dataIndex]: e.target.value };
      }
      return record;
    });
    setPatientsRecords(updatedRecords);
  };

  const handleEdit = (recordID) => {
    setEditingKey(recordID);
  };

  const handleSave = async (recordID) => {
    try {
      const recordToUpdate = patientsRecords.find(
        (record) => record.id === recordID
      );
      if (recordToUpdate) {
        await updateDoc(doc(db, "patientRecords", recordID), recordToUpdate);
      }
      setEditingKey("");
    } catch (error) {
      console.error("Error updating patient record:", error.message);
    }
  };

  const isEditing = (recordID) => recordID === editingKey;

  return (
    <div className="overflow-auto max-h-screen p-2">
      <h2>Doctor's Patients Records</h2>

      <Collapse accordion>
        {patientsRecords.map((record) => (
          <Panel key={record.id} header={<strong>{record.patientName}</strong>}>
            <Input
              addonBefore={<strong>Reference ID</strong>}
              value={record.reference}
              onChange={(e) => handleInputChange(e, record.id, "reference")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Patient Name</strong>}
              value={record.patientName}
              onChange={(e) => handleInputChange(e, record.id, "patientName")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Assigned Doctor</strong>}
              value={record.assignedDoctor}
              onChange={(e) =>
                handleInputChange(e, record.id, "assignedDoctor")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Medical History</strong>}
              value={record.medicalHistory}
              onChange={(e) =>
                handleInputChange(e, record.id, "medicalHistory")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Previous Diagnoses</strong>}
              value={record.previousDiagnoses}
              onChange={(e) =>
                handleInputChange(e, record.id, "previousDiagnoses")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Medications Prescribed Previously</strong>}
              value={record.medicationsPrescribed}
              onChange={(e) =>
                handleInputChange(e, record.id, "medicationsPrescribed")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Allergies</strong>}
              value={record.allergies}
              onChange={(e) => handleInputChange(e, record.id, "allergies")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Previous Surgeries or Treatments</strong>}
              value={record.surgeriesTreatment}
              onChange={(e) =>
                handleInputChange(e, record.id, "surgeriesTreatment")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Family Medical History</strong>}
              value={record.familyMedicalHistory}
              onChange={(e) =>
                handleInputChange(e, record.id, "familyMedicalHistory")
              }
              disabled={!isEditing(record.id)}
            />

            <Space>
              <Button
                type="success"
                onClick={() => handleSave(record.id)}
                icon={<SaveOutlined />}
                style={{ display: isEditing(record.id) ? "block" : "none" }}
              >
                Save
              </Button>
            </Space>
            <Button
              onClick={() => handleEdit(record.id)}
              icon={<EditOutlined />}
              style={{ display: isEditing(record.id) ? "none" : "block" }}
            >
              Edit
            </Button>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}

export default DoctorPatientsRecords;
