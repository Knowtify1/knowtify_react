import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import moment from "moment";
import { Table, Typography, Collapse } from "antd";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Define the typesofDoc array
const typesofDoc = [
  { value: "Orthopedics", label: "General Orthopaedic Surgery" },
  { value: "Internal Medicine", label: "Internal Medicine" },
  { value: "Hematology", label: "Internal Medicine (Adult Hematology)" },
  { value: "Infectious", label: "Internal Medicine (Infectious Diseases)" },
  { value: "Pulmonology", label: "Internal Medicine (Pulmonology)" },
  { value: "Ob", label: "Obstetrics and Gynecology" },
  { value: "Physical", label: "Physical Medicine and Rehabilitation" },
  { value: "Pediatrics", label: "Pediatrics, Vaccines, and Immunizations" },
];

function PatientsRecord() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [collapseHeight, setCollapseHeight] = useState("auto");

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
      } else {
        console.error("No patient data found for the given name.");
      }
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const groupByDoctor = (data) => {
    const grouped = {};
    data.forEach((record) => {
      const doctorKey = record.typeOfDoctor;
      if (!grouped[doctorKey]) {
        grouped[doctorKey] = [];
      }
      grouped[doctorKey].push(record);
    });
    return grouped;
  };

  const renderPanel = (doctor, records) => (
    <Panel header={getDoctorLabel(doctor)} key={doctor}>
      <Table
        dataSource={records}
        rowKey={(record) => record.id}
        className="bg-white"
        pagination={false}
        style={{ marginBottom: 20 }}
        columns={[
          {
            title: "Appointment Date",
            dataIndex: "appointmentDate",
            key: "appointmentDate",
            render: (text, record) =>
              moment(record.appointmentDate.toDate()).format("MMMM D, YYYY"),
          },
          {
            title: "Reason",
            dataIndex: "reasonForAppointment",
            key: "reasonForAppointment",
          },
          {
            title: "Patient Allergies",
            dataIndex: "patientAllergies",
            key: "patientAllergies",
          },
          {
            title: "Patient Family History",
            dataIndex: "patientFamilyHistory",
            key: "patientFamilyHistory",
          },
          {
            title: "Diagnosis",
            dataIndex: "previousDiagnoses",
            key: "previousDiagnoses",
          },
          {
            title: "Investigations ordered (labs, imaging, etc.)",
            dataIndex: "investigationsOrdered",
            key: "investigationsOrdered",
          },
          {
            title: "Treatment plan",
            dataIndex: "treatmentPlan",
            key: "treatmentPlan",
          },
          {
            title: "Referrals (if any)",
            dataIndex: "referrals",
            key: "referrals",
          },
          {
            title: "Lifestyle recommendations",
            dataIndex: "lifestyleRecommendations",
            key: "lifestyleRecommendations",
          },
          {
            title: "Follow-up plan",
            dataIndex: "followUpPlan",
            key: "followUpPlan",
          },
        ]}
      />
    </Panel>
  );

  // Function to get doctor label from typesofDoc array
  const getDoctorLabel = (doctorValue) => {
    const doctor = typesofDoc.find((doc) => doc.value === doctorValue);
    return doctor ? doctor.label : doctorValue;
  };

  return (
    <div className="overflow-x-auto top-0 left-0 right-0 bottom-0 p-4 bg-white">
      {patientDetails && (
        <Collapse
          accordion
          style={{ height: "100%", overflow: "auto" }}
          className="bg-white"
        >
          {Object.entries(groupByDoctor(patientDetails)).map(
            ([doctor, records]) => renderPanel(doctor, records)
          )}
        </Collapse>
      )}
    </div>
  );
}

export default PatientsRecord;
