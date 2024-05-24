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
import { Spin, Calendar, Badge, Modal as AntModal, Space } from "antd";
import moment from "moment";

function PatientCalendar() {
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatientData = async (phone) => {
      try {
        const patientsCollection = collection(db, "patients");
        const q = query(patientsCollection, where("contactNo", "==", phone));
        const patientSnapshot = await getDocs(q);
        const patients = patientSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatientsData(patients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient records:", error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPatientData(user.phoneNumber); // Fixed 'phone' to 'phoneNumber'
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
                  className="clickable-badge"
                  onClick={() => handleDateSelect(current, appointment)}
                  style={{ fontSize: "12px", color: "green" }}
                >
                  {(() => {
                    const appointmentTime = moment(
                      appointment.appointmentTime,
                      "HH:mm"
                    );
                    const hour = appointmentTime.hour();
                    const formattedTime = appointmentTime.format("hh:mm");

                    if (hour >= 7 && hour < 12) {
                      return `${formattedTime} am - ${appointment.assignedDoctor}`;
                    } else {
                      return `${formattedTime} pm - ${appointment.assignedDoctor}`;
                    }
                  })()}
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
          <Calendar cellRender={cellRender} style={{ width: "100%" }} />

          <AntModal
            title={`Appointments on ${selectedPatient?.appointmentDate
              ?.toDate()
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`}
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
                    "MMMM D, YYYY"
                  )}
                </p>
                <p>
                  Appointment Time:{" "}
                  <span>
                    {moment(
                      selectedPatient.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("h:mm")}{" "}
                    {moment(
                      selectedPatient.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("HH:mm") >= "07:00" &&
                    moment(
                      selectedPatient.appointmentTime.replace(/"/g, ""),
                      "h:mm A"
                    ).format("HH:mm") < "12:00"
                      ? "AM"
                      : "PM"}
                  </span>
                </p>
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
