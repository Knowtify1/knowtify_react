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
import BookForm from "../Patient/Components/BookForm.jsx";

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
        const patientRecordsCollection = collection(db, "patient_accounts");
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

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const createAppointment = () => {
    // Logic to create appointment
    // You can implement your appointment creation logic here
    console.log("Creating appointment...");
    openNotification(); // For demo, open notification when creating appointment
    setIsModalVisible(false); // Close modal after appointment is created
  };

  return (
    <div className="overflow-auto max-h-screen p-4">
      <br />
      <h3 className="text-3xl font-semibold text-left">
        Patient Appointment Details
      </h3>
      <br />
      {patientDetails && (
        <Card>
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
          <p>
            <strong>Appointment Status:</strong> {patientDetails.status}
          </p>
          <p>
            <strong>Type of Doctor:</strong> {patientDetails.typeOfDoctor}
          </p>
          <p>
            <strong>Appointment Date:</strong>{" "}
            {patientDetails.appointmentDate?.toDate().toLocaleDateString()}
          </p>
          <p>
            <strong>Appointment Time:</strong> {patientDetails.appointmentTime}
          </p>
        </Card>
      )}

      <Button
        onClick={showModal}
        type="primary"
        className="bg-green-600 rounded mt-3"
      >
        Book Another Appointment
      </Button>

      <div className="pl-8 pr-8 pb-5 pt-5">
        <Modal
          title="Book Another Appointment"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={800}
        >
          <Card>
            <p>
              Ready to prioritize your health? Schedule an appointment with our
              experienced healthcare professionals.
            </p>
            <div className="mt-12 grow">
              <div>
                <BookForm
                  onSuccess={createAppointment}
                  onClose={handleCancel}
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
