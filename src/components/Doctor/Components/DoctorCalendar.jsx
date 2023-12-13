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
          const userRef = doc(db, "users", userId);
          const docRef = doc(db, "doctors", userId);
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

    if (
      current.isAfter(startOfMonth, "day") &&
      current.isBefore(endOfMonth, "day")
    ) {
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
                text={appointment.patientName}
                onClick={() => handleDateSelect(current, filteredAppointments)}
              />
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  const currentDate = moment();
  const startOfMonth = currentDate.clone().startOf("month");
  const endOfMonth = currentDate.clone().endOf("month");

  const disabledDate = (current) => {
    return current && current < startOfMonth;
  };

  const calendarMode = "month";

  const handlePanelChange = (value, mode) => {
    console.log(value, mode);
  };

  const handleDateSelect = (date, appointments) => {
    setSelectedPatient(appointments[0]); // Assuming you want details of the first appointment
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <div>
      <Space direction="horizontal" size={10}>
        <h1>Date Today is:</h1>
        <p>{formattedDate}</p>
      </Space>

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
          <Calendar
            cellRender={cellRender}
            validRange={[startOfMonth, endOfMonth]}
            disabledDate={disabledDate}
            mode={calendarMode}
            onPanelChange={handlePanelChange}
          />

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
