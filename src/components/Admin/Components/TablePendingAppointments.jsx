import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Spin,
  DatePicker,
  Modal,
  Form,
  message,
  TimePicker,
} from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  where,
  query,
  fsTimeStamp,
  deleteDoc,
} from "../../../config/firebase.jsx";
import moment from "moment";
import { sendSMS } from "../../../config/sendSMS.jsx";
import dayjs from "dayjs"; // Import dayjs

function TablePendingAppointments() {
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

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
            text === "pending" ? "bg-red-600 text-white border-red-400" : ""
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
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: "green", borderColor: "green" }}
            onClick={() => handleApprove(record.key)}
          >
            Approve
          </Button>
          <Button
            type="primary"
            style={{ backgroundColor: "blue", borderColor: "blue" }}
            onClick={() => showModal(record)}
          >
            Reschedule
          </Button>
        </Space>
      ),
    },
  ];

  const handleApprove = async (key) => {
    try {
      const appointmentRef = doc(db, "appointments", key);
      await setDoc(
        appointmentRef,
        { status: "approved" },
        { merge: true },
        { approved: true }
      );
      message.success(`Appointment ${key} approved.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    try {
      const appointmentRef = doc(db, "appointments", key);
      const appointmentSnapshot = await getDoc(appointmentRef);

      const appointmentData = appointmentSnapshot.data(); // Store data for transfer to patients

      await addDoc(collection(db, "patients"), appointmentData); // Store data on patients

      await deleteDoc(appointmentRef); // Delete Data into appointments

      fetchAppointments(selectedDate, setData, setLoading);

      message.success(`Appointment approved and transferred to patients.`);
    } catch (error) {
      console.error("Error approving appointment:", error);
    }

    fetchAppointments(selectedDate, setData, setLoading);
  };

  const showModal = (record) => {
    setVisible(true);
    form.setFieldsValue({
      key: record.key,
      dateOfAppointment: moment(record.dateOfAppointment),
      appointmentTime: moment(record.appointmentTime, "h:mm A"),
    });
  };

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      updateAppointmentInTable(values);
      const { key, dateOfAppointment, appointmentTime } = values;
      const appointmentRef = doc(db, "appointments", key);
      await setDoc(
        appointmentRef,
        {
          appointmentDate: dateOfAppointment.toDate(),
          appointmentTime: appointmentTime.format("h:mm A"),
        },
        { merge: true }
      );
      console.log("Appointment updated successfully.");
      // Sending SMS to the patient
      const appointmentSnapshot = await getDoc(appointmentRef);
      const appointmentData = appointmentSnapshot.data();
      const contactNo = appointmentData.contactNo; // Assuming contactNo is the field name for the contact number
      const patientName = appointmentData.patientName; // Assuming patientName is the field name for the patient's name
      const message = `Good day, ${patientName}! Your booking with Mountain Studio Specialty Clinic has been rescheduled on Date: ${dateOfAppointment.format(
        "MM/DD/YYYY"
      )}, Time: ${appointmentTime.format(
        "h:mm A"
      )}. Please be at the clinic 5 minutes before your appointment schedule. Thank you!`;
      sendSMS(contactNo, message); // Send SMS
      setVisible(false);
      message.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const fetchAppointments = async (selectedDate, setData, setLoading) => {
    try {
      let appointmentsQuery = collection(db, "appointments");

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
        );
      }

      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsData = appointmentsSnapshot.docs
        .map((doc) => ({ key: doc.id, ...doc.data() }))
        .sort((a, b) => b.createdDate - a.createdDate);

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
      newData[index].appointmentTime = appointmentTime.format("h:mm A");
      setData(newData);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);

    fetchAppointments(selectedDate, setData, setLoading);
  };

  const formatDate = (date) => {
    if (date && date.toDate) {
      const options = { month: "long", day: "numeric", year: "numeric" };
      return date.toDate().toLocaleDateString(undefined, options);
    }
    return "";
  };

  const disabledDate = (current) => {
    // Disable past dates
    return current && current < dayjs().startOf("day");
  };

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex">
          <Space direction="horizontal" size={40}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker
                onChange={handleDateChange}
                disabledDate={disabledDate}
              />
            </Space>
            <h1>Pending Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1>
          </Space>

          {loading ? (
            <Spin size="small" className="block" />
          ) : (
            <Table columns={columns} dataSource={data} />
          )}

          <Modal
            title="Edit Appointment"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            cancelButtonProps={{ style: { color: "green" } }}
            okButtonProps={{ style: { color: "green" } }}
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
                <DatePicker disabledDate={disabledDate} />
              </Form.Item>
              <Form.Item
                name="appointmentTime"
                label="Appointment Time"
                rules={[{ required: true, message: "Please select a time" }]}
                style={{ marginBottom: 0 }}
              >
                <TimePicker format="h:mm A" minuteStep={30} />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </div>
    </>
  );
}

export default TablePendingAppointments;
