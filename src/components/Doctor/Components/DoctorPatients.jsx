import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "../../../config/firebase.jsx";
import {
  Spin,
  Space,
  Button,
  Card,
  DatePicker,
  Table,
  Input,
  notification,
  Select,
  Modal,
  Form,
} from "antd";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";
import { sendSMS } from "../../../config/sendSMS.jsx";

const { Search } = Input;
const { Option } = Select;

function DoctorPatients() {
  const [userDetails, setUserDetails] = useState(null);
  const [doctorsMoreDetails, setDoctorsMoreDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecordKey, setSelectedRecordKey] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users_accounts_records", userId);
          const docRef = doc(db, "doctors_accounts", userId);

          try {
            const docSnapshot = await getDoc(userRef);
            const doctorSnapshot = await getDoc(docRef);

            if (docSnapshot.exists() && doctorSnapshot.exists()) {
              const userData = docSnapshot.data();
              const specialty = doctorSnapshot.data();

              const dateOfRegistrationString = userData.dateofregistration
                .toDate()
                .toString();

              setUserDetails({
                ...userData,
                dateofregistration: dateOfRegistrationString,
              });

              setDoctorsMoreDetails(specialty);

              const patientsQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", specialty.uid)
              );

              const patientsSnapshot = await getDocs(patientsQuery);
              const patientsData = patientsSnapshot.docs.map((doc) => ({
                patientID: doc.id,
                ...doc.data(),
              }));
              setPatients(patientsData);
              setFilteredPatients(patientsData);
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          } finally {
            setLoading(false);
          }
        }
      });

      return () => unsubscribe();
    };

    fetchUserDetails();
  }, []);

  const loadAllPatients = () => {
    try {
      setFilteredPatients(patients);
    } catch (error) {
      console.error("Error loading all patients:", error);
      notification.error({
        message: "Error",
        description: "Failed to load all patients. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const loadTodayPatients = () => {
    try {
      const today = new Date();
      const todayString = moment(today).format("YYYY-MM-DD");

      const todayPatients = patients.filter(
        (patient) =>
          moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
          todayString
      );

      if (todayPatients.length === 0) {
        notification.error({
          message: "No Patients Today",
          description: "There are no patients scheduled for today.",
        });
      } else {
        setFilteredPatients(todayPatients);
      }
    } catch (error) {
      console.error("Error filtering today's patients:", error);
      notification.error({
        message: "Error",
        description: "Failed to filter today's patients. Please try again.",
      });
    }
  };

  useEffect(() => {
    loadAllPatients();
  }, [doctorsMoreDetails]);

  const columns = [
    {
      title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
      sorter: (a, b) => a.patientName.localeCompare(b.patientName),
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
      title: "Reason",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    { title: "Age", dataIndex: "age", key: "age" },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: "green", borderColor: "green" }}
            onClick={() => onEditClick(record)}
          >
            EMR
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

  const onEditClick = (record) => {
    console.log(record);
    const url = "../doctoremr";
    navigate(url, { state: { patientEMRData: record } });
  };

  const onClickAll = () => {
    loadAllPatients();
  };

  const onClickToday = () => {
    loadTodayPatients();
  };

  const compareAppointments = (a, b) => {
    const dateComparison = a.appointmentDate - b.appointmentDate;

    if (dateComparison === 0) {
      const timeA = moment(a.appointmentTime, "HH:mm");
      const timeB = moment(b.appointmentTime, "HH:mm");
      return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
    }

    return dateComparison;
  };

  const sortPatientsByDateTime = (patientsArray) => {
    return patientsArray.sort(compareAppointments);
  };

  const showModal = (record) => {
    if (!record || !record.patientID) {
      console.error("Record or patientID is undefined.");
      return;
    }
    setSelectedRecordKey(record.patientID);
    form.setFieldsValue({
      key: record.patientID,
      dateOfAppointment: record.appointmentDate
        ? moment(record.appointmentDate.toDate())
        : null, // Ensure a valid date is passed, or pass null if no date is available
      appointmentTime: moment(record.appointmentTime, "h:mm A"),
    });
    setVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
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

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <Card className="overflow-auto max-h-screen p-0">
            <h2>Patients</h2>
            <Space direction="horizontal" size={10} className="mb-2">
              <Search
                placeholder="Search"
                onSearch={(value) => {
                  const filteredData = patients.filter((patient) =>
                    Object.values(patient)
                      .join(" ")
                      .toLowerCase()
                      .includes(value.toLowerCase())
                  );
                  setFilteredPatients(sortPatientsByDateTime(filteredData));
                }}
                className="w-60"
              />
              <Button onClick={onClickAll}>All</Button>
              <Button onClick={onClickToday}>Today</Button>
            </Space>

            <Table
              dataSource={sortPatientsByDateTime(filteredPatients)}
              columns={columns}
              rowKey="patientID"
            />
          </Card>
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
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;
