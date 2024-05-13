import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Spin,
  DatePicker,
  Button,
  Modal,
  Select,
  message,
  Form,
} from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  getDoc,
  getDocs,
  where,
  query,
  fsTimeStamp,
  runTransaction,
} from "../../../config/firebase.jsx";
import { sendSMS } from "../../../config/sendSMS.jsx";
import moment from "moment";
import { notification } from "antd";

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

const TableApprovedAppointments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();
  const [selectedRecordKey, setSelectedRecordKey] = useState(null);

  const columns = [
    { title: "Name", dataIndex: "patientName" },
    {
      title: "Appointment Date",
      dataIndex: "dateOfAppointment",
      render: (text, record) => formatDate(record.appointmentDate),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      render: (text, record) => formatAppointmentTime(record.appointmentTime),
    },
    { title: "Reason", dataIndex: "reasonForAppointment" },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => renderStatus(text),
    },
    { title: "Type of Doctor", dataIndex: "typeOfDoctor" },
    { title: "ReferenceID", dataIndex: "reference" },
    { title: "Doctor", dataIndex: "assignedDoctor" },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => renderActionButtons(record),
    },
  ];

  const fetchApprovedAppointments = async (selectedDate) => {
    try {
      let appointmentsQuery = collection(db, "patients");

      if (selectedDate) {
        const startOfDayTimestamp = fsTimeStamp.fromDate(
          moment(selectedDate).startOf("day").toDate()
        );
        const endOfDayTimestamp = fsTimeStamp.fromDate(
          moment(selectedDate).endOf("day").toDate()
        );

        appointmentsQuery = query(
          appointmentsQuery,
          where("appointmentDate", ">=", startOfDayTimestamp),
          where("appointmentDate", "<=", endOfDayTimestamp)
        );
      }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentsData = {};
      appointmentsSnapshot.docs.forEach((doc) => {
        const appointment = doc.data();
        const key = appointment.reference; // Assuming reference is the field name for reference ID
        if (!appointmentsData[key]) {
          appointmentsData[key] = [];
        }
        appointmentsData[key].push({
          key: doc.id,
          ...appointment,
        });
      });

      const flattenedData = Object.values(appointmentsData).flatMap(
        (appointments) => appointments
      );

      setData(flattenedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);

    fetchAppointments(selectedDate, setData, setLoading);
  };

  const renderStatus = (text) => (
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
  );

  const formatAppointmentTime = (time) => {
    const appointmentTime = moment(time, "h:mm A");
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
  };

  const formatDate = (date) =>
    date
      ? date.toDate().toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";

  const renderActionButtons = (record) => (
    <Space direction="horizontal">
      {record.status !== "assigned" && (
        <>
          <Button
            type="primary"
            style={{ backgroundColor: "green", borderColor: "green" }}
            onClick={() => handleAssign(record)}
          >
            Assign
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: "blue", borderColor: "blue" }}
            onClick={() => showModal(record)}
          >
            Reschedule
          </Button>
        </>
      )}
    </Space>
  );

  const showModal = (record) => {
    if (!record || !record.key) {
      console.error("Record or record key is undefined.");
      return;
    }

    setSelectedRecordKey(record.key);

    setVisible(true);

    form.setFieldsValue({
      key: record.key,
      dateOfAppointment: moment(record.dateOfAppointment),
      appointmentTime: moment(record.appointmentTime, "h:mm A"),
    });
  };

  useEffect(() => {
    fetchAppointments(selectedDate, setData, setLoading);
  }, [selectedDate]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const updateAppointmentInTable = (values) => {
    const { key, dateOfAppointment, appointmentTime } = values;
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);
    if (index > -1) {
      newData[index].dateOfAppointment = dateOfAppointment;
      newData[index].dateOfAppointment = dateOfAppointment.toDate();
      // Ensure appointmentTime is in the correct format
      const formattedAppointmentTime = moment(
        appointmentTime,
        "HH:mm A"
      ).format("h:mm A");
      newData[index].appointmentTime = formattedAppointmentTime;
      setData(newData);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      updateAppointmentInTable(values);
      const { key, dateOfAppointment, appointmentTime } = values;
      const appointmentRef = doc(db, "patients", key);
      await setDoc(
        appointmentRef,
        {
          appointmentDate: dateOfAppointment.toDate(),
          appointmentTime: moment(appointmentTime, "HH:mm").format("h:mm A"),
        },
        { merge: true }
      );

      // Generate message with selected date and time from the modal
      const appointmentSnapshot = await getDoc(appointmentRef);
      const appointmentData = appointmentSnapshot.data();
      const contactNo = appointmentData.contactNo; // Assuming contactNo is the field name for the contact number
      const patientName = appointmentData.patientName; // Assuming patientName is the field name for the patient's name
      const formattedDate = dateOfAppointment.format("MMMM D, YYYY");
      const formattedTime = moment(appointmentTime, "HH:mm").format("h:mm A"); // Format time to 12-hour format
      const message = `Good day, ${patientName}! Your booking with Mountain Top Specialty Clinic has been rescheduled on Date: ${formattedDate}, Time: ${formattedTime}. Please be at the clinic 5 minutes before your appointment schedule. Thank you!`;
      sendSMS(contactNo, message); // Send SMS
      setVisible(false);
      message.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const timeSlots = [
    "7:00",
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const fetchAppointments = async (selectedDate) => {
    try {
      let appointmentsQuery = collection(db, "patients");

      if (selectedDate) {
        const startOfDayTimestamp = fsTimeStamp.fromDate(
          moment(selectedDate).startOf("day").toDate()
        );
        const endOfDayTimestamp = fsTimeStamp.fromDate(
          moment(selectedDate).endOf("day").toDate()
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
      setData(appointmentsData);
      setLoading(false);
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
    if (!record || !record.key) {
      console.error("Record or record key is undefined.");
      return;
    }

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

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    // Fetch approved appointments initially when component mounts
    fetchApprovedAppointments(selectedDate, setData, setLoading);

    // Set up interval to fetch approved appointments every 60 seconds
    const interval = setInterval(() => {
      fetchApprovedAppointments(selectedDate, setData, setLoading);
    }, 6);

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
        <Space direction="vertical" size={25} className="flex">
          <Space direction="horizontal" size={250}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>{getCurrentDateMessage()}</h1>
            <h1>Approved Appointments: {data.length}</h1>
          </Space>
          {loading ? (
            <Spin size="small" className="block" />
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 3 }}
              scroll={{ x: true }} // Enable horizontal scrolling
            />
          )}
          <Modal
            title="Select Doctor"
            visible={isModalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            cancelButtonProps={{ style: { color: "green" } }}
            okButtonProps={{ className: "bg-green-700" }}
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

          <Modal
            title="Edit Appointment"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            cancelButtonProps={{ style: { color: "green" } }}
            okButtonProps={{ className: "bg-green-700" }}
          >
            <Form form={form} layout="vertical" initialValues={{}}>
              <Form.Item name="key" hidden>
                <input type="hidden" />
              </Form.Item>
              <Form.Item
                name="dateOfAppointment"
                label="Appointment Date"
                rules={[{ required: true, message: "Please select a date" }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                name="appointmentTime"
                label="Appointment Time"
                rules={[{ required: true, message: "Please select a time" }]}
                style={{ marginBottom: 0 }}
              >
                <Select>
                  {timeSlots.map((slot) => (
                    <Option key={slot} value={slot}>
                      {moment(slot, "HH:mm").format("h:mm A")}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </div>
    </>
  );
};

export default TableApprovedAppointments;
