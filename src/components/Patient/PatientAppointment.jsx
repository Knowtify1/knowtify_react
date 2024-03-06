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
        setPatientDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPatientDetails = async (name) => {
    try {
      const patientQuerySnapshot = await getDocs(
        query(collection(db, "patients"), where("patientName", "==", name))
      );

      if (!patientQuerySnapshot.empty) {
        const patientData = patientQuerySnapshot.docs[0].data();
        setPatientDetails(patientData);
      } else {
        // If patient not found in patients collection, try fetching from patientRecords collection
        const patientRecordsCollection = collection(db, "patientRecords");
        const patientRecordsQuery = query(
          patientRecordsCollection,
          where("patientName", "==", name)
        );
        const patientRecordsSnapshot = await getDocs(patientRecordsQuery);

        if (!patientRecordsSnapshot.empty) {
          const patientData = patientRecordsSnapshot.docs[0].data();
          setPatientDetails(patientData);
        } else {
          console.error("No patient data found in patientRecords collection.");
        }
      }
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

    // Fetch appointment details for current appointments
    if (reference) {
      const referenceId = reference; // Assuming reference is stored in userDetails
      const appointmentsQuerySnapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("referenceId", "==", referenceId)
        )
      );

      if (!appointmentsQuerySnapshot.empty) {
        const appointmentsData = appointmentsQuerySnapshot.docs.map((doc) =>
          doc.data()
        );
        console.log("Current Appointments:", appointmentsData);
        // Set or process the fetched appointmentsData as needed
      } else {
        console.log("No current appointments found.");
      }
    }
  };

  return (
    <div className="overflow-auto max-h-screen p-4">
      <br />
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold">Patient Appointment Details</h3>
      </div>

      <br />
      {patientDetails && (
        <Card title="Patient Information">
          <p>
            <strong>Name:</strong> {patientDetails.patientName}
          </p>
          <p>
            <strong>Patient Address:</strong> {patientDetails.patientAddress}
          </p>
          <p>
            <strong>Patient Age:</strong> {patientDetails.age}
          </p>
          <p>
            <strong>Reference ID:</strong> {patientDetails.reference}
          </p>
        </Card>
      )}

      {patientDetails && (
        <div className="flex flex-wrap">
          <Card
            title="Current Appointment"
            className="w-full sm:w-1/2 bg-gray-300"
          >
            <p>
              <CheckCircleOutlined /> <strong>Appointment Status:</strong>{" "}
              {patientDetails.status}
            </p>
            <p>
              <ClockCircleOutlined /> <strong>Type of Doctor:</strong>{" "}
              {patientDetails.typeOfDoctor}
            </p>
            <p>
              <strong>Appointment Date:</strong>{" "}
              {patientDetails.appointmentDate?.toDate().toLocaleDateString()}
            </p>
            <p>
              <strong>Appointment Time:</strong>{" "}
              {patientDetails.appointmentTime}
            </p>
          </Card>

          <Card
            title="Past Appointment"
            className="w-full sm:w-1/2 bg-gray-500"
          >
            <p>
              <CheckCircleOutlined /> <strong>Appointment Status:</strong>{" "}
              {patientDetails.status}
            </p>
            <p>
              <ClockCircleOutlined /> <strong>Type of Doctor:</strong>{" "}
              {patientDetails.typeOfDoctor}
            </p>
            <p>
              <strong>Appointment Date:</strong>{" "}
              {patientDetails.appointmentDate?.toDate().toLocaleDateString()}
            </p>
            <p>
              <strong>Appointment Time:</strong>{" "}
              {patientDetails.appointmentTime}
            </p>
          </Card>
        </div>
      )}

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
