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
import moment from "moment";

const { Panel } = Collapse;

function DoctorPatientsRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchName, setSearchName] = useState("");
  const [highlightedPanelKey, setHighlightedPanelKey] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthID(user);
        fetchPatientsRecords(user.uid);
      } else {
        setAuthID(null);
        setPatientsRecords([]);
        setFilteredRecords([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = patientsRecords.filter((patient) =>
      patient.patientName.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredRecords(filtered);

    // Highlight the first matching panel
    if (filtered.length > 0) {
      setHighlightedPanelKey(filtered[0].id);
    } else {
      setHighlightedPanelKey(null);
    }
  }, [searchName, patientsRecords]);

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

      // Sort the records by patient name
      records.sort((a, b) => a.patientName.localeCompare(b.patientName));

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

      {/* Search Input */}
      <Input
        placeholder="Search by name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      {/* Rendering Filtered and Sorted Patient Records */}
      <Collapse
        accordion
        activeKey={highlightedPanelKey}
        onChange={setHighlightedPanelKey}
      >
        {filteredRecords.map((record) => (
          <Panel key={record.id} header={<strong>{record.patientName}</strong>}>
            {/* Display patient details */}
            <div>
              <p>
                <strong>Patient Name:</strong> {record.patientName}
              </p>
              <p>
                <strong>Age:</strong> {record.age}
              </p>
              <p>
                <strong>Contact Number:</strong> {record.contactNo}
              </p>
              <p>
                <strong>Appointment Date:</strong>{" "}
                {moment(record.appointmentDate.toDate()).format("MMMM D, YYYY")}
              </p>
              <p>
                <strong>Appointment Time:</strong>{" "}
                {record.appointmentTime.replace(/"/g, "")}
              </p>
              <p>
                <strong>Reason:</strong> {record.reasonForAppointment}
              </p>
              <p>
                <strong>Family History:</strong> {record.patientFamilyHistory}
              </p>
              <p>
                <strong>History:</strong> {record.patientHistory}
              </p>
              <p>
                <strong>Allergies:</strong> {record.patientAllergies}
              </p>
            </div>
            <Input
              addonBefore={<strong>Reference ID</strong>}
              value={record.reference}
              onChange={(e) => handleInputChange(e, record.id, "reference")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Diagnosis</strong>}
              value={record.previousDiagnoses}
              onChange={(e) =>
                handleInputChange(e, record.id, "previousDiagnoses")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Treatment plan</strong>}
              value={record.treatmentPlan}
              onChange={(e) => handleInputChange(e, record.id, "treatmentPlan")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Medications Prescribed </strong>}
              value={record.medicationsPrescribed}
              onChange={(e) =>
                handleInputChange(e, record.id, "medicationsPrescribed")
              }
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Referrals (if any)</strong>}
              value={record.referrals}
              onChange={(e) => handleInputChange(e, record.id, "referrals")}
              disabled={!isEditing(record.id)}
            />
            <Input
              addonBefore={<strong>Follow-up plan</strong>}
              value={record.followUpPlan}
              onChange={(e) => handleInputChange(e, record.id, "followUpPlan")}
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
