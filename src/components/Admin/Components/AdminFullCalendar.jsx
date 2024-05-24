import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Select,
  Calendar,
  Badge,
  Card,
  Space,
  Spin,
  Modal as AntModal,
} from "antd";
import moment from "moment";
import {
  collection,
  getDocs,
  where,
  query,
  db,
} from "../../../config/firebase.jsx";

const { Option } = Select;

const AdminFullCalendar = () => {
  const location = useLocation();
  const { specialty } = location.state || {};

  const [doctorsData, setDoctorsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientsData, setPatientsData] = useState([]);
  const [calendarMode, setCalendarMode] = useState("month");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentSelectedDate, setCurrentSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(moment());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorsCollection = collection(db, "doctors_accounts");
        const q = query(doctorsCollection, where("specialty", "==", specialty));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDoctorsData(data);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [specialty]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDoctor) return;

      try {
        setLoading(true);
        const patientsCollection = collection(db, "patients");
        const patientsQuery = query(
          patientsCollection,
          where("assignedDoctor", "==", selectedDoctor)
        );

        const patientsSnapshot = await getDocs(patientsQuery);
        const patientsData = patientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPatientsData(patientsData);
      } catch (error) {
        console.error("Error fetching patient data from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [selectedDoctor]);

  const handleSelectChange = (value) => {
    setSelectedDoctor(value);
  };

  const cellRender = (current) => {
    const formattedDate = current.format("YYYY-MM-DD");

    const appointmentsOnDate = patientsData.filter(
      (patient) =>
        moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
          formattedDate && patient.assignedDoctor === selectedDoctor
    );

    if (appointmentsOnDate.length > 0) {
      return (
        <ul className="events">
          {appointmentsOnDate.map((appointment) => (
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
                        return `${formattedTime} am - ${appointment.patientName}`;
                      } else {
                        return `${formattedTime} pm - ${appointment.patientName}`;
                      }
                    })()}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      );
    } else {
      return null;
    }
  };

  const handleDateSelect = (selectedDate, patient) => {
    setCurrentSelectedDate({ date: selectedDate, data: [patient] });
    setSelectedPatient(patient);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handlePanelChange = (value, mode) => {
    setCalendarMode(mode);
  };

  const handleCalendarChange = (date) => {
    setCalendarDate(date);
  };

  return (
    <>
      <Card
        title={`Calendar - ${specialty || "No Specialty Selected"}`}
        style={{ width: "100%" }}
      >
        <Space direction="horizontal" size={30}>
          <Select
            style={{ width: "200px" }}
            placeholder="Select a doctor"
            onChange={handleSelectChange}
            disabled={loading}
          >
            {doctorsData.map((doctor) => (
              <Option key={doctor.id} value={doctor.name}>
                {doctor.name}
              </Option>
            ))}
          </Select>

          {loading ? (
            <Spin size="small" />
          ) : selectedDoctor ? (
            <Space direction="horizontal" size={30}>
              <p>Calendar for: {selectedDoctor}</p>
              <p>
                Specialty:{" "}
                {
                  doctorsData.find((doc) => doc.name === selectedDoctor)
                    ?.specialty
                }
              </p>
            </Space>
          ) : null}
        </Space>
        <Calendar
          cellRender={cellRender}
          mode={calendarMode}
          onPanelChange={handlePanelChange}
          onSelect={handleCalendarChange}
          fullscreen={true}
        />
      </Card>
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
  );
};

export default AdminFullCalendar;
