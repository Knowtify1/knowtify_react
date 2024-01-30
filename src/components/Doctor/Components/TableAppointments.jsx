import React, { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import { Spin, Table, Button } from "antd";
import moment from "moment";

function TableAppointments() {
  const [uid, setUid] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUid(user.uid);

          const doctorDocRef = doc(db, "doctors", user.uid);

          try {
            const doctorSnapshot = await getDoc(doctorDocRef);

            if (doctorSnapshot.exists()) {
              setDoctorData(doctorSnapshot.data());

              const patientsQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", doctorSnapshot.id)
              );
              const patientsSnapshot = await getDocs(patientsQuery);
              const patientsData = patientsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Sort patientsData based on appointmentDate and appointmentTime in ascending order
              const sortedPatientsData = patientsData.sort((a, b) => {
                const dateA = moment(a.appointmentDate.toDate()).format("YYYYMMDD");
                const timeA = moment(a.appointmentTime, "HH:mm").format("HHmm");

                const dateB = moment(b.appointmentDate.toDate()).format("YYYYMMDD");
                const timeB = moment(b.appointmentTime, "HH:mm").format("HHmm");

                return dateA + timeA - (dateB + timeB);
              });

              setAssignedPatients(sortedPatientsData);
            } else {
              console.log("Doctor document does not exist");
            }
          } catch (error) {
            console.error("Error fetching doctor data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setUid(null);
          setDoctorData(null);
          setAssignedPatients([]);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  const columns = [
    {
      title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    { title: "Patient Address", dataIndex: "patientAddress", key: "patientAddress" },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (text, record) =>
        moment(record.appointmentDate.toDate()).format("MMMM D, YYYY"),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      render: (text, record) =>
        moment(record.appointmentTime, "HH:mm").format("HH:mm"),
    },
    {
      title: "Reason",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    { title: "Age", dataIndex: "age", key: "age" },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button type="link" onClick={() => handleCheck(record.key)}>
          Check
        </Button>
      ),
    },
  ];

  return (
    <div className="overflow-auto max-h-screen p-2">
      {doctorData && (
        <div>
          <p>Doctor Name: {doctorData.name}</p>
        </div>
      )}

      <Table dataSource={assignedPatients} columns={columns} />
    </div>
  );
}

export default TableAppointments;
