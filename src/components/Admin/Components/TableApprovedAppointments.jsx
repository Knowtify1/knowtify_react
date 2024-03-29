import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Spin,
  DatePicker,
  Button,
  Modal,
  Select,
  message, // Import message from antd
} from "antd";
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
import moment from "moment";

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
              ? "bg-green-600 text-white"
              : text === "assigned"
              ? "bg-blue-600 text-white"
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
      render: (text, record) => (
        <Space direction="horizontal">
          {record.status !== "assigned" && (
            <>
              <Button type="link" onClick={() => handleAssign(record)}>
                Assign
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const formatDate = (date) => {
    if (date && date.toDate) {
      const options = { month: "long", day: "numeric", year: "numeric" };
      return date.toDate().toLocaleDateString(undefined, options);
    }
    return "";
  };

  const fetchApprovedAppointments = async (
    selectedDate,
    setData,
    setLoading
  ) => {
    try {
      let appointmentsQuery = collection(db, "patients");

      if (selectedDate) {
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
        );
      }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));

      // Sort appointmentsData based on appointmentDate and appointmentTime
      appointmentsData.sort((a, b) => {
        const dateComparison = b.appointmentDate - a.appointmentDate;

        if (dateComparison === 0) {
          // If the dates are equal, compare by appointmentTime
          const timeA = moment(a.appointmentTime, "HH:mm");
          const timeB = moment(b.appointmentTime, "HH:mm");
          return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
        }

        return dateComparison;
      });

      if (typeof setData === "function") {
        setData(appointmentsData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  const fetchDoctorsList = async (typeOfDoctor) => {
    try {
      const doctorsQuery = collection(db, "doctors_accounts");
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
    setSelectedPatient(record);
    setIsModalVisible(true);

    const typeOfDoctor = record.typeOfDoctor || null;
    fetchDoctorsList(typeOfDoctor);
  };

  const handleModalOk = async () => {
    if (selectedDoctor) {
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

        setIsModalVisible(false);
        fetchApprovedAppointments(selectedDate, setData, setLoading);

        // Show success message
        message.success("Appointment assigned successfully!");
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
    fetchApprovedAppointments(selectedDate, setData, setLoading);
  };

  useEffect(() => {
    // Fetch approved appointments initially when component mounts
    fetchApprovedAppointments(selectedDate, setData, setLoading);

    // Set up interval to fetch approved appointments every 60 seconds
    const interval = setInterval(() => {
      fetchApprovedAppointments(selectedDate, setData, setLoading);
    }, 60000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
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

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex items-left">
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
            visible={isModalVisible} // Corrected prop name
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
