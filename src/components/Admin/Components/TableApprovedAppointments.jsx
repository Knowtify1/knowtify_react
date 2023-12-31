import React, { useState, useEffect } from "react";
import { Table, Space, Spin, DatePicker, Button, Modal, Select } from "antd";
import {
  doc,
  db,
  collection,
  getDocs,
  where,
  query,
  fsTimeStamp,
  runTransaction,
} from "../../../config/firebase.jsx";

//const { RangePicker } = DatePicker;
const { Option } = Select;

const typesofDoc = [
  { value: "Internal Medicine", label: "Internal Medicine" },
  { value: "Hematology", label: "Internal Medicine (Adult Hematology)" },
  { value: "Infectious", label: "Internal Medicine (Infectious Diseases)" },
  { value: "Pulmonology", label: "Internal Medicine (Pulmonology)" },
  { value: "Ob", label: "Obstetrics and Gynecology" },
  { value: "Orthopedics", label: "General Orthopaedic Surgery" },
  { value: "Physical", label: "Physical Medicine and Rehabilitation" },
  { value: "Pediatrics", label: "Pediatrics, Vaccines, and Immunizations" },
];

function TableApprovedAppointments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctorType, setSelectedDoctorType] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const columns = [
    {
      title: "Name",
      dataIndex: "patientName",
    },
    {
      title: "Appointment Date",
      dataIndex: "dateOfAppointment",
      render: (text, record) => (
        <span>{formatDate(record.appointmentDate)}</span>
      ),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      render: (text) => <span>{text.replace(/"/g, "")}</span>,
    },
    {
      title: "Reason",
      dataIndex: "reasonForAppointment",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span
          className={`inline-block px-2 py-1 rounded border ${
            text === "approved"
              ? "bg-green-500 text-white border-red-400"
              : text === "assigned"
              ? "bg-blue-500 text-white border-blue-400"
              : ""
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Type of Doctor",
      dataIndex: "typeOfDoctor",
    },
    {
      title: "ReferenceID",
      dataIndex: "reference",
    },
    {
      title: "Doctor",
      dataIndex: "assignedDoctor",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) =>
        record.status !== "assigned" && (
          <Space direction="horizontal">
            <Button type="link" onClick={() => handleAssign(record)}>
              Assign
            </Button>
          </Space>
        ),
    },
  ];

  const fetchApprovedAppointments = async (
    selectedDate,
    setData,
    setLoading
  ) => {
    try {
      let appointmentsQuery = collection(db, "patients");

      if (selectedDate) {
        // If a date is selected, add a filter based on date
        const startOfDayTimestamp = fsTimeStamp.fromDate(
          new Date(selectedDate.setHours(0, 0, 0, 0))
        );
        const endOfDayTimestamp = fsTimeStamp.fromDate(
          new Date(selectedDate.setHours(23, 59, 59, 999))
        );

        appointmentsQuery = query(
          appointmentsQuery,
          where("appointmentDate", ">=", startOfDayTimestamp),
          where("appointmentDate", "<=", endOfDayTimestamp)
          //where("approved", "===", true)
        );
      }
      // else {
      //   // Add a filter to only fetch appointments with status "Pending"
      //   appointmentsQuery = query(
      //     appointmentsQuery,
      //     where("status", "==", "assigned")
      //   );
      // }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));

      //setData(appointmentsData);
      if (typeof setData === "function") {
        setData(appointmentsData);
        setLoading(false);
      }

      console.error("firebase data", appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  const fetchDoctorsList = async (typeOfDoctor) => {
    try {
      const doctorsQuery = collection(db, "doctors");
      const doctorsSnapshot = await getDocs(doctorsQuery);
      const doctorsData = doctorsSnapshot.docs
        .filter((doc) => doc.data().specialty === typeOfDoctor)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      setDoctorsList(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleAssign = (record) => {
    console.log("Assigning key:", record.key);
    console.log("Record:", record);
    setSelectedPatient(record);
    setIsModalVisible(true);

    const typeOfDoctor = record.typeOfDoctor || null;
    console.log("typeofdoc ", typeOfDoctor);
    fetchDoctorsList(typeOfDoctor);
  };

  const handleModalOk = async () => {
    if (selectedDoctor) {
      console.log("Selected Doctor:", selectedDoctor);

      try {
        const { id, name, specialty } = selectedDoctor;
        const patientRef = doc(db, "patients", selectedPatient.key);

        await runTransaction(db, async (transaction) => {
          const patientDoc = await transaction.get(patientRef);
          if (!patientDoc.exists()) {
            throw new Error("Patient document does not exist!");
          }

          const updatedData = {
            assignedDoctor: name,
            assignedDoctorID: id,
            status: "assigned",
          };

          transaction.update(patientRef, updatedData);
        });

        console.log("Patient document updated successfully!");
        setIsModalVisible(false);
        fetchApprovedAppointments(selectedDate, setData, setLoading);
      } catch (error) {
        console.error("Error updating patient document:", error);
      }
    }
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDateChange = (date) => {
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);
    console.log(selectedDate);
    fetchApprovedAppointments(selectedDate, setData, setLoading);
  };

  useEffect(() => {
    fetchApprovedAppointments(selectedDate, setData, setLoading);
  }, [selectedDate, setData, setLoading]);

  const getCurrentDateMessage = () => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString(undefined, options);

    return `Today is ${formattedDate}`;
  };

  const formatDate = (date) => {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toDate().toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex items-center">
          <Space direction="horizontal" size={30}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>Approved Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1>
          </Space>

          {loading ? (
            <Spin size="small" className="block" />
          ) : (
            <Table columns={columns} dataSource={data} />
          )}

          {/* Modal for Doctor Type Selection */}
          <Modal
            title="Select Doctor"
            open={isModalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            okButtonProps={{ className: "bg-green-500" }}
          >
            <Select
              style={{ width: "100%" }}
              placeholder="Select Doctor"
              onChange={(value) => {
                const selectedDoc = doctorsList.find((doc) => doc.id === value);
                setSelectedDoctor(selectedDoc);
              }}
            >
              {doctorsList.map((doctor) => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </Option>
              ))}
            </Select>
          </Modal>
        </Space>
      </div>
    </>
  );
}

export default TableApprovedAppointments;