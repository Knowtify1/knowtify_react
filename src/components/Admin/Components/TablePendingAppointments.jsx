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
  Select,
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
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [typesofDoc, settypesofDoc] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setdoctorTimeOptions] = useState({});
  const [availableDays, setAvailableDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "settings"));
        const availabilityData = {};
        const timeOptionsData = {};
        let specialtiesData = [];

        querySnapshot.forEach((doc) => {
          const specialty = doc.data().specialty;
          const specialtyLabel = doc.data().specialtyLabel;
          const days = doc.data().days || [];
          let times = doc.data().times || [];

          specialtiesData = [
            ...specialtiesData,
            { value: specialty, label: specialtyLabel },
          ];
          availabilityData[specialty] = days;

          /// Sort time options ensuring 12 PM comes after AM
          times = times.sort((a, b) => {
            const hourA = parseInt(a.split(":")[0]);
            const hourB = parseInt(b.split(":")[0]);

            if (hourA >= 7 && hourA < 12 && hourB >= 7 && hourB < 12) {
              return hourA - hourB;
            } else if (hourA >= 7 && hourA < 12) {
              return -1;
            } else if (hourB >= 7 && hourB < 12) {
              return 1;
            } else if (hourA === 12 && hourB < 12) {
              return -1; // Ensure 12 PM comes after AM
            } else if (hourB === 12 && hourA < 12) {
              return 1; // Ensure 12 PM comes after AM
            } else {
              return hourA - hourB;
            }
          });

          const formattedTimes = times.map((time) => ({
            value: time,
            label: `${time} ${
              parseInt(time.split(":")[0]) >= 7 &&
              parseInt(time.split(":")[0]) < 12
                ? "AM"
                : parseInt(time.split(":")[0]) === 12
                ? "PM"
                : "PM"
            }`,
          }));

          timeOptionsData[specialty] = formattedTimes;
        });

        // Convert timeOptionsData to the desired format
        const doctorTimeOptions = {};
        Object.keys(timeOptionsData).forEach((specialty) => {
          doctorTimeOptions[specialty] = timeOptionsData[specialty].map(
            (time) => ({
              value: time.value,
              label: time.label,
            })
          );
        });

        settypesofDoc(specialtiesData);
        setDoctorAvailability(availabilityData);
        setdoctorTimeOptions(doctorTimeOptions);

        console.log(doctorTimeOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const selectedType = form.getFieldValue("typedoctor");
    setAvailableDays(doctorAvailability[selectedType] || []);
  }, [form, doctorAvailability]);

  const handleTypeChange = (value) => {
    const selectedType = value;
    const timeOptions = doctorTimeOptions[selectedType] || [];
    form.setFieldsValue({
      timepicker: timeOptions.length > 0 ? timeOptions[0].value : null,
    });
    setAvailableDays(doctorAvailability[selectedType] || []);
  };

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
    if (!record || !record.key) {
      console.error("Record or record key is undefined.");
      return;
    }
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

  const updateAppointmentInTable = async (values) => {
    try {
      const { key, dateOfAppointment, appointmentTime } = values;
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        newData[index].dateOfAppointment = dateOfAppointment;
        newData[index].appointmentTime = appointmentTime.format("h:mm A");
        setData(newData);

        // Update appointment in Firestore collection
        const appointmentRef = doc(db, "appointments", key);
        await setDoc(
          appointmentRef,
          {
            dateOfAppointment: fsTimeStamp.fromDate(dateOfAppointment.toDate()),
            appointmentTime: appointmentTime.format("HH:mm"),
          },
          { merge: true }
        );

        console.log("Appointment updated successfully.");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleOk = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();
      const { key, adate, timepicker } = values;

      // Update appointment in table and Firestore
      await updateAppointmentInTable(values);

      // Close modal
      handleCancel();

      // Retrieve appointment data
      const appointmentRef = doc(db, "appointments", key);
      const appointmentSnapshot = await getDoc(appointmentRef);
      const appointmentData = appointmentSnapshot.data();

      if (!appointmentData) {
        // Handle case where appointment data is undefined
        throw new Error("Appointment data is not available.");
      }

      const contactNo = appointmentData.contactNo;
      const patientName = appointmentData.patientName;

      // Compose SMS message content
      const messageContent = `Good day, ${patientName}! Your appointment has been rescheduled to Date: ${moment(
        adate
      ).format("MM/DD/YYYY")}, Time: ${moment(timepicker, "HH:mm").format(
        "hh:mm A"
      )}. Please be at the clinic 5 minutes before your appointment schedule. Thank you!`;

      // Send SMS
      await sendSMS(contactNo, messageContent);

      // Log success message
      console.log("SMS sent successfully.");
      message.success("Appointment rescheduled and SMS sent successfully.");
    } catch (error) {
      // Log and handle errors
      console.error("Error rescheduling appointment:", error);
      message.error("Failed to reschedule appointment. Please try again.");
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
      <div className="container mx-auto px-4">
        <Space direction="vertical" size={4} className="md:flex md:flex-col">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="mr-2">Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </div>
            <div className="flex items-center">
              <h1 className="mr-2">Pending Appointments: {data.length}</h1>
              {/* Add getCurrentDateMessage() here */}
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
            />
          )}
          <Modal
            title="Edit Appointment"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            cancelButtonProps={{ style: { color: "green" } }}
            okButtonProps={{ style: { color: "green" } }}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                label="Type of Doctor to Consult"
                name="typedoctor"
                rules={[{ required: true, message: "Select Type" }]}
              >
                <Select
                  options={typesofDoc}
                  placeholder="Select a type"
                  onChange={handleTypeChange}
                />
              </Form.Item>
              <Form.Item
                label="Appointment Date"
                rules={[{ required: true, message: "Select Date" }]}
                name="adate"
              >
                <DatePicker
                  disabledDate={(current) => {
                    if (current && current < dayjs().startOf("day")) {
                      return true;
                    }
                    const dayOfWeek = current.day();
                    return !availableDays.includes(
                      dayjs().day(dayOfWeek).format("dddd")
                    );
                  }}
                  placeholder="Select Date"
                />
              </Form.Item>
              <Form.Item
                label="Appointment Time"
                name="timepicker"
                rules={[{ required: true, message: "Select Time" }]}
              >
                <Select
                  disabled={!form.getFieldValue("typedoctor")}
                  options={
                    doctorTimeOptions[form.getFieldValue("typedoctor")] || []
                  }
                />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </div>
    </>
  );
}

export default TablePendingAppointments;
