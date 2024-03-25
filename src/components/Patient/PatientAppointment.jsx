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
import { Modal, Button, notification, Table, Card } from "antd";
import BookAppointmentForm from "./BookAppointmentForm.jsx";
import FollowUpForm from "../Patient/Components/FollowUpForm.jsx";
import { sendSMS } from "../../config/sendSMS.jsx";

function PatientAppointment() {
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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

      // Calculate remaining days for each appointment
      const updatedAppointments = allAppointments.map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate.toDate());
        const today = new Date();
        const diffTime = appointmentDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...appointment, daysRemaining: diffDays };
      });

      const sortedAppointments = updatedAppointments.sort(
        (a, b) => a.daysRemaining - b.daysRemaining
      );

      setAppointments(sortedAppointments);
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

  const sendReminderSMS = async (
    contactNo,
    patientName,
    appointmentDate,
    appointmentTime,
    assignedDoctor
  ) => {
    try {
      const appointmentDateTime = appointmentDate.toDate();
      const cleanedAppointmentTime = appointmentTime
        ? appointmentTime.replace(/"/g, "")
        : "";

      const message = `Hello ${patientName}, this is to remind you of your upcoming appointment with Mountain Studio Specialty Clinic on ${appointmentDateTime.toLocaleDateString()} at ${cleanedAppointmentTime}. Please be on time. Thank you!`;

      sendSMS(contactNo, message);
      console.log("SMS reminder sent successfully.");
      // Add message when reminder is set
      notification.success({
        message: "Reminder Set",
        description: "A reminder has been set for this appointment.",
      });
    } catch (error) {
      console.error("Failed to send SMS reminder:", error);
    }
  };

  const createAppointment = async () => {
    console.log("Creating appointment...");
    openNotification();
    setIsModalVisible(false);
    // Add message when appointment is booked
    notification.success({
      message: "Appointment Booked",
      description: "Your appointment has been successfully booked!",
    });
  };

  const handleFollowUp = (appointment) => {
    setSelectedAppointment(appointment);
    setFollowUpModalVisible(true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Type of Doctor",
      dataIndex: "typeOfDoctor",
      key: "typeOfDoctor",
    },
    {
      title: "Assigned Doctor",
      dataIndex: "assignedDoctor",
      key: "assignedDoctor",
    },
    {
      title: "Reason for Appointment",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (text, record) =>
        record.appointmentDate?.toDate().toLocaleDateString(),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      render: (text, record) => record.appointmentTime.replace(/"/g, ""),
    },
    {
      title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Days Remaining",
      dataIndex: "daysRemaining",
      key: "daysRemaining",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button
            onClick={() =>
              sendReminderSMS(
                record.contactNo,
                record.patientName,
                record.appointmentDate,
                record.appointmentTime,
                record.assignedDoctor
              )
            }
            type="primary"
            className="bg-yellow-400 rounded mt-3 ml-3"
          >
            Set Reminder
          </Button>
          <Button
            onClick={() => handleFollowUp(record)}
            type="default"
            className="bg-green-600 rounded mt-3 ml-3"
          >
            Follow-Up
          </Button>
        </span>
      ),
    },
  ];

  const rowClassName = (record) => {
    // Find the appointment with the least remaining days
    const minRemainingDaysAppointment = appointments.reduce((prev, current) => {
      return prev.daysRemaining < current.daysRemaining ? prev : current;
    });

    // Highlight the row if it corresponds to the appointment with the least remaining days
    if (record === minRemainingDaysAppointment) {
      return "bg-blue-100"; // Highlight the appointment with the least remaining days
    }
    return "";
  };

  return (
    <div>
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold pt-10" style={{ color: "#333" }}>
          Patient Appointment Details
        </h3>{" "}
      </div>
      <Card>
        <div className="overflow-auto max-h-screen p-4">
          <div className="w-full text-center">
            <Button
              onClick={showModal}
              type="success"
              className="bg-green-600 rounded mt-3 ml-3"
            >
              Book Another Appointment
            </Button>
          </div>
          <br />
          <div>
            <div>
              <h2 className="text-xl font-semibold">Consultations</h2>
              <Table
                columns={columns}
                dataSource={appointments.filter(
                  (appointment) =>
                    appointment.reasonForAppointment === "consultation"
                )}
                rowKey={(record, index) => index}
                rowClassName={rowClassName}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Follow-Ups</h2>
              <Table
                columns={columns}
                dataSource={appointments.filter(
                  (appointment) =>
                    appointment.reasonForAppointment === "follow-up"
                )}
                rowKey={(record, index) => index}
                rowClassName={rowClassName}
              />
            </div>
          </div>
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
                  Ready to prioritize your health? Schedule an appointment with
                  our experienced healthcare professionals.
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

          <Modal
            title="Follow-Up Check-Up"
            visible={followUpModalVisible}
            onCancel={() => setFollowUpModalVisible(false)}
            footer={null}
          >
            {selectedAppointment && (
              <FollowUpForm
                appointment={selectedAppointment}
                handleFollowUp={() => handleFollowUp(selectedAppointment)}
              />
            )}
          </Modal>
        </div>
      </Card>
    </div>
  );
}

export default PatientAppointment;
