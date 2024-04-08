import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Spin,
  DatePicker,
  Modal,
  Form,
  TimePicker,
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
import dayjs from "dayjs";

const { Option } = Select;

function TablePendingAppointments() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm(); // Properly connected useForm instance
  const [typesofDoc, settypesofDoc] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setdoctorTimeOptions] = useState({});
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedRecordKey, setSelectedRecordKey] = useState(null);

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
              return -1;
            } else if (hourB === 12 && hourA < 12) {
              return 1;
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
    setSelectedRecordKey(record.key); // Store the key of the selected record
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
      newData[index].dateOfAppointment = dateOfAppointment.toDate();
      newData[index].appointmentTime = moment(appointmentTime).format("HH:mm");
      setData(newData);
    }
  };

  const handleDateChange = (date) => {
    const selectedDate = date ? date.toDate() : null;
    setSelectedDate(selectedDate);

    fetchAppointments(selectedDate, setData, setLoading);
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
          appointmentTime: moment(appointmentTime, "HH:mm").format("h:mm A"),
        },
        { merge: true }
      );

      // Generate message with selected date and time from the modal
      const appointmentSnapshot = await getDoc(appointmentRef);
      const appointmentData = appointmentSnapshot.data();
      const contactNo = appointmentData.contactNo; // Assuming contactNo is the field name for the contact number
      const patientName = appointmentData.patientName; // Assuming patientName is the field name for the patient's name
      const formattedTime = moment(appointmentTime, "HH:mm").format("h:mm A"); // Format time as "7:00 PM"
      const message = `Good day, ${patientName}! Your booking with Mountain Studio Specialty Clinic has been rescheduled on Date: ${dateOfAppointment.format(
        "MM/DD/YYYY"
      )}, Time: ${formattedTime}. Please be at the clinic 5 minutes before your appointment schedule. Thank you!`;
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

  const formatDate = (date) => {
    if (date && date.toDate) {
      const options = { month: "long", day: "numeric", year: "numeric" };
      return date.toDate().toLocaleDateString(undefined, options);
    }
    return "";
  };

  return (
    <>
      <div>
        <Space direction="vertical" size={20} className="flex">
          <Space direction="horizontal" size={40}>
            <Space direction="horizontal">
              <h1>Select Appointment Date:</h1>
              <DatePicker onChange={handleDateChange} />
            </Space>
            <h1>Pending Appointments: {data.length}</h1>
            <h1>{getCurrentDateMessage()}</h1>
          </Space>
          {loading ? (
            <Spin size="small" className="block" />
          ) : (
            <Form form={form} component={false}>
              {" "}
              {/* Set component={false} to prevent automatic form wrapping */}
              <Table
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }} // Enable horizontal scrolling
              />
            </Form>
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
}

export default TablePendingAppointments;
