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

  // Modify the fetchPatientDetails function to sort and merge appointments
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

      const mergedAppointments = mergeAppointments(allAppointments);

      const updatedAppointments = mergedAppointments.map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate.toDate());
        const today = new Date();
        const diffTime = appointmentDate.getTime() - today.getTime();
        const diffDays = Math.max(
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
          0
        );
        const status = diffDays === 0 ? "Done" : appointment.status;
        return { ...appointment, daysRemaining: diffDays, status: status };
      });

      const doneAppointments = updatedAppointments.filter(
        (appointment) =>
          appointment.status === "Done" ||
          appointment.daysRemaining === 0 ||
          patientRecordsData.some(
            (record) => record.reference === appointment.reference
          )
      );

      const pendingAppointments = updatedAppointments.filter(
        (appointment) =>
          appointment.status !== "Done" &&
          appointment.daysRemaining !== 0 &&
          !patientRecordsData.some(
            (record) => record.reference === appointment.reference
          )
      );

      setAppointments(pendingAppointments);
      setDoneAppointments(doneAppointments);

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

  // Function to merge appointments with identical details
  const mergeAppointments = (appointments) => {
    const mergedAppointmentsMap = new Map();
    appointments.forEach((appointment) => {
      const referenceId = appointment.reference;
      if (mergedAppointmentsMap.has(referenceId)) {
        // Merge appointment details
        const existingAppointment = mergedAppointmentsMap.get(referenceId);
        const mergedAppointment = {
          ...existingAppointment,
          ...appointment,
        };
        mergedAppointmentsMap.set(referenceId, mergedAppointment);
      } else {
        mergedAppointmentsMap.set(referenceId, appointment);
      }
    });
    return Array.from(mergedAppointmentsMap.values());
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
      // Format appointment date
      const formattedAppointmentDate = moment(appointmentDate.toDate()).format(
        "MMMM D, YYYY"
      );

      // Format appointment time if available
      let formattedAppointmentTime = "";
      if (appointmentTime) {
        const appointmentTimeMoment = moment(appointmentTime, "h:mm A");
        const timeLabel = appointmentTimeMoment.isBetween(
          moment("6:00 AM", "h:mm A"),
          moment("11:59 AM", "h:mm A")
        )
          ? "AM"
          : "PM";
        formattedAppointmentTime = `${appointmentTimeMoment.format(
          "h:mm"
        )} ${timeLabel}`;
      }

      // Construct SMS message
      let message = `Hello ${patientName}, this is to remind you of your upcoming appointment with Mountain Top Specialty Clinic on ${formattedAppointmentDate}`;

      // Append appointment time if available
      if (formattedAppointmentTime) {
        message += ` at ${formattedAppointmentTime}`;
      }

      // Append assigned doctor if available
      if (assignedDoctor) {
        message += ` with Dr. ${assignedDoctor}`;
      }

      // Add additional message content
      message += `. Please be at the clinic 5 minutes before your appointment schedule. Thank you!`;

      // Sending SMS to the patient
      sendSMS(contactNo, message); // Send SMS
      console.log("SMS reminder sent successfully.");

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
          moment("6:00 AM", "h:mm A"),
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
            type="primary"
            className="bg-yellow-400 rounded mt-3 ml-3"
          >
            Set Reminder
          </Button>
          <Button
            onClick={() => handleFollowUp(record)}
            type="primary"
            className="bg-green-700 rounded mt-3 ml-3"
          >
            Follow-Up
          </Button>
        </span>
      ),
    },
  ];

  const rowClassName = (record) => {
    if (appointments.length === 0) {
      return ""; // Return empty string if asppointments array is empty
    }

    // Find the appointment with the least remaining days
    const minRemainingDaysAppointment = appointments.reduce((prev, current) => {
      return prev.daysRemaining < current.daysRemaining ? prev : current;
    });

    // Highlight the row if it corresponds to the appointment with the least remaining days
    if (record === minRemainingDaysAppointment) {
      return "bg-blue-200"; // Highlight the appointment with the least remaining days
    }
    return "";
  };
  return (
    <div className="w-full px-0 sm:px-0 md:px-4 lg:px-16 xl:px-0">
      <Card
        className="overflow-auto pl-0" // Set a maximum height and padding
        style={{
          idth: "100%",
          height: "auto",
          backgroundColor: "#fff",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Patient Appointment Details
          </h3>{" "}
        </div>
        <div className="overflow-auto max-h-screen p-4">
          <div className="w-full text-center">
            <Button
              onClick={showModal}
              type="primary"
              className="bg-green-700 rounded mt-3 ml-3"
            >
              Book Another Appointment
            </Button>
          </div>
          <br />
          <div>
            <div>
              <h1>Consultation Appointments: {consultationCount}</h1>
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
              <h1>Follow-Up Appointments: {followUpCount}</h1>
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
          <div className="pl-2 pr-2 pb-5 pt-5">
            <Modal
              title="Book Another Appointment"
              visible={isModalVisible}
              width={700}
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
            width={700}
            footer={null}
          >
            <Card>
              <p>
                Ready to prioritize your health? Schedule an appointment with
                our experienced healthcare professionals.
              </p>
              <div className="mt-12 grow">
                <div>
                  <FollowUpForm
                    appointment={selectedAppointment}
                    handleFollowUp={() => handleFollowUp(selectedAppointment)}
                  />
                </div>
              </div>
            </Card>
          </Modal>
        </div>
      </Card>
    </div>
  );
}

export default PatientAppointment;
