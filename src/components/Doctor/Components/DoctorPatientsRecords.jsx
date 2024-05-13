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
import { Input, Space, Button, Table } from "antd";
import { SaveOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";

function DoctorPatientsRecords() {
  const [authID, setAuthID] = useState(null);
  const [patientsRecords, setPatientsRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchName, setSearchName] = useState("");

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

  const handleCancel = () => {
    setEditingKey("");
  };

  const isEditing = (recordID) => recordID === editingKey;

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      sorter: (a, b) => a.patientName.localeCompare(b.patientName),
    },
    {
      title: "Reason for Appointment",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    {
      title: "Patient Allergies",
      dataIndex: "patientAllergies",
      key: "patientAllergies",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "patientAllergies")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Patient Family History",
      dataIndex: "patientFamilyHistory",
      key: "patientFamilyHistory",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "patientFamilyHistory")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Diagnosis",
      dataIndex: "previousDiagnoses",
      key: "previousDiagnoses",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "previousDiagnoses")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Investigations Ordered",
      dataIndex: "investigationsOrdered",
      key: "investigationsOrdered",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "investigationsOrdered")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Treatment Plan",
      dataIndex: "treatmentPlan",
      key: "treatmentPlan",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) => handleInputChange(e, record.id, "treatmentPlan")}
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Medications Prescribed",
      dataIndex: "medicationsPrescribed",
      key: "medicationsPrescribed",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "medicationsPrescribed")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Referrals",
      dataIndex: "referrals",
      key: "referrals",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) => handleInputChange(e, record.id, "referrals")}
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Lifestyle Recommendations",
      dataIndex: "lifestyleRecommendations",
      key: "lifestyleRecommendations",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) =>
              handleInputChange(e, record.id, "lifestyleRecommendations")
            }
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Follow-up Plan",
      dataIndex: "followUpPlan",
      key: "followUpPlan",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Input
            value={text}
            onChange={(e) => handleInputChange(e, record.id, "followUpPlan")}
          />
        ) : (
          text
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, record) => {
        const editable = isEditing(record.id);
        return editable ? (
          <Space>
            <Button
              type="primary"
              className="bg-green-600 "
              onClick={() => handleSave(record.id)}
              icon={<SaveOutlined />}
            >
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        ) : (
          <Button
            type="primary"
            className="bg-blue-600"
            onClick={() => handleEdit(record.id)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <h2>Doctor's Patients Records</h2>

      {/* Search Input */}
      <Input
        placeholder="Search by name"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      {/* Rendering Table */}
      <Table
        dataSource={filteredRecords}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}

export default DoctorPatientsRecords;
