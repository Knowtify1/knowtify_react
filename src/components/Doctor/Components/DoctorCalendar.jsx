import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import { Spin, Space, Calendar, Badge, Modal as AntModal } from "antd";
import moment from "moment";

function DoctorCalendar() {
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [doctorsMoreDetails, setDoctorsMoreDetails] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "doctors_accounts", userId);
          const docRef = doc(db, "doctors_accounts", userId);
          const patientsCollection = collection(db, "patients");

          try {
            const [userSnapshot, doctorSnapshot] = await Promise.all([
              getDoc(userRef),
              getDoc(docRef),
            ]);

            if (userSnapshot.exists() && doctorSnapshot.exists()) {
              const userData = userSnapshot.data();
              const specialty = doctorSnapshot.data();

              const dateOfRegistrationString = userData.dateofregistration
                .toDate()
                .toString();

              setDoctorDetails({
                ...userData,
                dateofregistration: dateOfRegistrationString,
              });

              setDoctorsMoreDetails(specialty);

              const patientsQuery = query(
                patientsCollection,
                where("assignedDoctor", "==", doctorsMoreDetails.name),
                where("assignedDoctorID", "==", doctorsMoreDetails.uid)
              );

              const patientsSnapshot = await getDocs(patientsQuery);
              const patientsData = patientsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              setPatientsData(patientsData);
              setLoading(false);
            } else {
              console.log("No such document!");
              setLoading(false);
            }
          } catch (error) {
            console.error("Error fetching documents:", error);
            setLoading(false);
          }
        }
      });

      return () => unsubscribe();
    };

    fetchUserDetails();
  }, [doctorsMoreDetails.name, doctorsMoreDetails.uid]);

  const formattedDate = moment().format("YYYY-MM-DD");

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

export default DoctorCalendar;
