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
import moment from "moment";

function PatientAppointment() {
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doneAppointments, setDoneAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationCount, setConsultationCount] = useState(0);
  const [followUpCount, setFollowUpCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "users_accounts_records"),
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
        setDoneAppointments([]);
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

      // Update appointments status and remaining days
      const updatedAppointments = allAppointments.map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate.toDate());
        const today = new Date();
        const diffTime = appointmentDate.getTime() - today.getTime();
        const diffDays = Math.max(
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
          0
        ); // Ensure diffDays is not negative
        const status = diffDays === 0 ? "Done" : appointment.status;
        return { ...appointment, daysRemaining: diffDays, status: status };
      });

      const pendingAppointments = updatedAppointments.filter(
        (appointment) => appointment.daysRemaining > 0
      );

      const doneAppointments = updatedAppointments.filter(
        (appointment) => appointment.daysRemaining === 0
      );

      setAppointments(pendingAppointments);
      setDoneAppointments(doneAppointments);

      // Calculate total counts
      const consultationAppointments = pendingAppointments.filter(
        (appointment) => appointment.reasonForAppointment === "consultation"
      );
      const followUpAppointments = pendingAppointments.filter(
        (appointment) => appointment.reasonForAppointment === "follow-up"
      );
      setConsultationCount(consultationAppointments.length);
      setFollowUpCount(followUpAppointments.length);
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
      // Calculate the date one day before the appointment
      const appointmentDateTime = appointmentDate.toDate();
      const reminderDate = new Date(appointmentDateTime);
      reminderDate.setDate(reminderDate.getDate() - 1);

      // Remove quotation marks if appointmentTime is defined
      const cleanedAppointmentTime = appointmentTime
        ? appointmentTime.replace(/"/g, "")
        : "";

      // Ensure assignedDoctor is defined
      const doctor = assignedDoctor || "Doctor"; // If assignedDoctor is undefined, use "Doctor" as default

      // Construct SMS message
      const message = `Hello ${patientName}, this is to remind you of your upcoming appointment with Mountain Top Specialty Clinic on ${appointmentDateTime.toLocaleDateString()} at ${cleanedAppointmentTime} with Dr. ${doctor}. Please be on time. Thank you!`;

      // Check if it's time to send the reminder
      const today = new Date();
      if (
        today.getDate() === reminderDate.getDate() &&
        today.getMonth() === reminderDate.getMonth() &&
        today.getFullYear() === reminderDate.getFullYear()
      ) {
        // Sending SMS to the patient
        sendSMS(contactNo, message); // Send SMS
        console.log("SMS reminder sent successfully.");
      } else {
        console.log("Reminder SMS not sent. It's not time yet.");
      }
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
        moment(record.appointmentDate.toDate()).format("MMMM D, YYYY"),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      render: (text, record) => {
        const appointmentTime = moment(text, "h:mm A");
        const timeLabel = appointmentTime.isBetween(
          moment("7:00 AM", "h:mm A"),
          moment("11:59 AM", "h:mm A")
        )
          ? "AM"
          : "PM";
        return (
          <span>
            {appointmentTime.format("h:mm")} {timeLabel}
          </span>
        );
      },
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
            type="success"
            className="bg-yellow-400 rounded mt-3 ml-3"
          >
            Set Reminder
          </Button>
          <Button
            onClick={() => handleFollowUp(record)}
            type="success"
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
    <div className="w-full px-0 sm:px-0 md:px-6 lg:px-16 xl:px-0">
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
              <h1>Pending Consultation Appointments: {consultationCount}</h1>
              <Table
                columns={columns}
                dataSource={appointments.filter(
                  (appointment) =>
                    appointment.reasonForAppointment === "consultation"
                )}
                pagination={{ pageSize: 2 }}
                rowKey={(record, index) => index}
                rowClassName={rowClassName}
              />
            </div>
            <div>
              <h1>Pending Follow-Up Appointments: {followUpCount}</h1>
              <Table
                columns={columns}
                dataSource={appointments.filter(
                  (appointment) =>
                    appointment.reasonForAppointment === "follow-up"
                )}
                pagination={{ pageSize: 2 }}
                rowKey={(record, index) => index}
                rowClassName={rowClassName}
              />
            </div>
          </div>
          <div>
            <h1>Past Appointments: {doneAppointments.length}</h1>
            <Table
              columns={columns}
              dataSource={doneAppointments}
              pagination={{ pageSize: 2 }}
              rowKey={(record, index) => index}
              rowClassName={rowClassName}
            />
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
