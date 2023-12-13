import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Select, Calendar, Badge, Card, Space, Spin, Modal } from "antd";
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentSelectedDate, setCurrentSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorsCollection = collection(db, "doctors");
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

  const handleSelectChange = async (value) => {
    setSelectedDoctor(value);

    try {
      setLoading(true);
      const patientsCollection = collection(db, "patients");
      const patientsQuery = query(
        patientsCollection,
        where(
          "typeOfDoctor",
          "==",
          doctorsData.find((doctor) => doctor.id === value)?.specialty
        ),
        where("status", "==", "assigned"),
        where(
          "assignedDoctor",
          "==",
          doctorsData.find((doctor) => doctor.id === value)?.name
        )
      );

      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientsData(patientsData);

      console.log("patientData", patientsData);
    } catch (error) {
      console.error("Error fetching patient data from Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => handleDateSelect(current, appointment)}
              />
            </li>
          ))}
        </ul>
      );
    }

    return null;
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

  const currentDate = moment();
  const startOfMonth = currentDate.clone().startOf("month");
  const endOfMonth = currentDate.clone().endOf("month");
  const disabledDate = (current) => {
    return current && current < startOfMonth;
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
              <Option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </Option>
            ))}
          </Select>

          {loading ? (
            <Spin size="small" />
          ) : selectedDoctor ? (
            <Space direction="horizontal" size={30}>
              <p>
                Calendar for:{" "}
                {doctorsData.find((doc) => doc.id === selectedDoctor)?.name}
              </p>
              <p>
                Specialty:{" "}
                {
                  doctorsData.find((doc) => doc.id === selectedDoctor)
                    ?.specialty
                }
              </p>
            </Space>
          ) : null}
        </Space>
        <Calendar
          cellRender={cellRender}
          validRange={[startOfMonth, endOfMonth]}
          disabledDate={disabledDate}
          mode={calendarMode}
          onPanelChange={handlePanelChange}
        />
      </Card>
      <Modal
        title={`Appointments on ${currentSelectedDate?.date?.format(
          "DD-MM-YYYY"
        )}`}
        open={modalVisible}
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
      </Modal>
    </>
  );
};

export default AdminFullCalendar;
