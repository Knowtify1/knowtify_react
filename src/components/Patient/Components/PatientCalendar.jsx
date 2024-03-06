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
import { Spin, Space, Calendar, Badge, Modal as AntModal } from "antd";
import moment from "moment";

function PatientCalendar() {
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatientData = async (email) => {
      try {
        const patientsCollection = collection(db, "patients");
        const q = query(patientsCollection, where("email", "==", email));
        const patientSnapshot = await getDocs(q);
        const patients = patientSnapshot.docs.map((doc) => doc.data());
        setPatientsData(patients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient records:", error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPatientData(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const cellRender = (current) => {
    const formattedDate = current.format("YYYY-MM-DD");
    const filteredAppointments = patientsData.filter(
      (patient) =>
        moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
        formattedDate
    );

    return (
      <ul className="events">
        {filteredAppointments.map((appointment) => (
          <li key={appointment.id}>
            <Badge
              status="success"
              text={
                <span
                  className="clickable-badge" // Add this class for styling
                  onClick={() => handleDateSelect(current, appointment)}
                >
                  {moment(appointment.appointmentTime, "HH:mm").format("HH:mm")}{" "}
                  - {appointment.patientName}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date, selectedPatient) => {
    setSelectedPatient(selectedPatient);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Calendar cellRender={cellRender} />

          <AntModal
            title={`Appointments on ${selectedPatient?.appointmentDate
              ?.toDate()
              .toLocaleDateString()}`}
            visible={modalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            {selectedPatient && (
              <Space direction="vertical" size={10}>
                <p>Patient Name: {selectedPatient.patientName}</p>
                <p>
                  Appointment Date:{" "}
                  {moment(selectedPatient.appointmentDate.toDate()).format(
                    "MMMM Do YYYY"
                  )}
                </p>
                <p>Appointment Time: {selectedPatient.appointmentTime}</p>
                <p>Reason: {selectedPatient.reasonForAppointment}</p>
                <p>Doctor: {selectedPatient.assignedDoctor}</p>
                <p>Reference ID: {selectedPatient.reference}</p>
              </Space>
            )}
          </AntModal>
        </>
      )}
    </div>
  );
}

export default PatientCalendar;
