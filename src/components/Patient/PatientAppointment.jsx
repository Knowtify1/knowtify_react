import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../config/firebase.jsx";
import { Modal, Button, Card, notification } from "antd";
import BookAppointmentForm from "../Patient/Components/BookAppointmentForm.jsx";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

function PatientAppointment() {
  const [userDetails, setUserDetails] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        setAppointments([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (name) => {
    try {
      const appointmentsQuerySnapshot = await getDocs(
        query(collection(db, "appointments"), where("patientName", "==", name))
      );
      const patientRecordsQuerySnapshot = await getDocs(
        query(
          collection(db, "patientRecords"),
          where("patientName", "==", name)
        )
      );
      const patientsQuerySnapshot = await getDocs(
        query(collection(db, "patients"), where("patientName", "==", name))
      );

      const appointmentsData = appointmentsQuerySnapshot.docs.map((doc) =>
        doc.data()
      );
      const patientRecordsData = patientRecordsQuerySnapshot.docs.map((doc) =>
        doc.data()
      );
      const patientsData = patientsQuerySnapshot.docs.map((doc) => doc.data());

      const allAppointments = [
        ...appointmentsData,
        ...patientRecordsData,
        ...patientsData,
      ];
      setAppointments(allAppointments);
    } catch (error) {
      console.error("Error fetching patient details:", error.message);
    }
  };

  const openNotification = () => {
    notification.success({
      message: "Appointment Booked",
      description: "Your appointment has been successfully booked!",
    });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const createAppointment = async () => {
    // Logic to create appointment
    // You can implement your appointment creation logic here
    console.log("Creating appointment...");
    openNotification(); // For demo, open notification when creating appointment
    setIsModalVisible(false); // Close modal after appointment is created
  };

  return (
    <div className="overflow-auto max-h-screen p-4">
      <br />
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold">Patient Appointment Details</h3>
      </div>

      <br />
      <div className="grid grid-cols-3 gap-4">
        {appointments.map((appointment, index) => (
          <Card key={index} title={`Appointment ${index + 1}`}>
            <p>
              <strong>Name:</strong> {appointment.patientName}
            </p>
            <p>
              <strong>Status:</strong> {appointment.status}
            </p>
            <p>
              <strong>Type of Doctor:</strong> {appointment.typeOfDoctor}
            </p>
            <p>
              <strong>Assigned Doctor:</strong> {appointment.assignedDoctor}
            </p>
            <p>
              <strong>Reason for Appointment:</strong>{" "}
              {appointment.reasonForAppointment}
            </p>
            <p>
              <strong>Appointment Date:</strong>{" "}
              {appointment.appointmentDate?.toDate().toLocaleDateString()}
            </p>
            <p>
              <strong>Appointment Time:</strong> {appointment.appointmentTime}
            </p>
            <p>
              <strong>Reference ID:</strong> {appointment.reference}
            </p>
            {/* Add other appointment details as needed */}
          </Card>
        ))}
      </div>

      <Button
        onClick={showModal}
        type="success"
        className="bg-green-600 rounded mt-3"
      >
        Book Another Appointment
      </Button>

      <div className="pl-8 pr-8 pb-5 pt-5">
        <Modal
          title="Book Another Appointment"
          visible={isModalVisible}
          width={800}
          footer={null} // Remove OK and Cancel buttons
          onCancel={handleModalClose} // Handle modal close
        >
          <Card>
            <p>
              Ready to prioritize your health? Schedule an appointment with our
              experienced healthcare professionals.
            </p>
            <div className="mt-12 grow">
              <div>
                <BookAppointmentForm
                  createAppointment={createAppointment}
                  closeModal={handleModalClose}
                />
              </div>
            </div>
          </Card>
        </Modal>
      </div>
    </div>
  );
}

export default PatientAppointment;
