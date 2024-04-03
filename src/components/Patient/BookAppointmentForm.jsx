import React, { useState, useEffect } from "react";
import { Button, DatePicker, Form, Input, Select, Row, Col, Modal } from "antd";
import { Timestamp, getDoc, doc } from "firebase/firestore";
import {
  auth,
  db,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  fsTimeStamp,
} from "../../config/firebase";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import "dayjs/locale/en";

const { TextArea } = Input;

const generateUniqueReference = () => {
  const prefix = "AP";
  const randomDigits = Math.floor(Math.random() * 10000000); // Generates a random 7-digit number
  return `${prefix}${randomDigits}`;
};

const BookAppointmentForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [availableDays, setAvailableDays] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalCondition, setModalCondition] = useState("");
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setDoctorTimeOptions] = useState({});
  const [typesofDoc, setTypesofDoc] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showForm, setShowForm] = useState(true); // New state to control form visibility

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await getDoc(
          doc(db, "patient_accounts", auth.currentUser.uid)
        );
        if (userDoc.exists()) {
          const userDetails = userDoc.data();
          // Auto-fill the form with user details
          form.setFieldsValue({
            patientname: userDetails.name,
            contactno: userDetails.phone,
            age: userDetails.age,
            patientaddress: userDetails.patientAddress,
          });
          setPatientDetails(userDetails);
        } else {
          console.log("User details not found.");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, [form]);

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

        setTypesofDoc(specialtiesData);
        setDoctorAvailability(availabilityData);
        setDoctorTimeOptions(doctorTimeOptions);
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

  const onFinish = async (values) => {
    const {
      patientname,
      contactno,
      age,
      patientaddress,
      reasonforappointment,
      typedoctor,
      adate,
      timepicker,
    } = values;

    setButtonLoading(true);

    const datePart = adate.startOf("day");
    const appointmentDate = datePart.toDate();

    const selectedTime = JSON.stringify(timepicker);
    const uniqueReference = generateUniqueReference();

    try {
      // Count pending appointments for the selected date, time, and type of doctor
      const existingAppointmentsQuerySnapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("appointmentDate", "==", appointmentDate),
          where("typeOfDoctor", "==", typedoctor),
          where("appointmentTime", "==", selectedTime),
          where("status", "==", "pending")
        )
      );

      const numExistingAppointments = existingAppointmentsQuerySnapshot.size;

      if (numExistingAppointments >= 2 - 1) {
        const message =
          "There are already 2 appointments booked for the selected date and time. Please choose a different Time.";
        setModalClosable(false);
        setModalCondition("schedexists");
        setModalMessage(message);
        showModal();
      } else {
        const userData = {
          createdDate: Timestamp.now(),
          patientName: patientname,
          contactNo: contactno,
          age: age,
          patientAddress: patientaddress,
          reasonForAppointment: reasonforappointment,
          typeOfDoctor: typedoctor,
          appointmentDate: appointmentDate,
          appointmentTime: JSON.stringify(timepicker),
          approved: false,
          assignedDoctor: "",
          status: "pending",
          reference: uniqueReference,
        };
        await addDoc(collection(db, "appointments"), userData);
        const successMessage = "Appointment booked successfully!";
        setModalCondition("success");
        setModalMessage(successMessage);
        showModal();
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      const errorMessage =
        "There are already 2 appointments booked for the selected date and time. Please choose a different Time.";
      setModalCondition("error");
      setModalMessage(errorMessage);
      showModal();
      setButtonLoading(false); // Enable the submit button again
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    if (modalCondition === "exists") {
      navigate("/login");
    } else if (modalCondition === "schedexists") {
      setModalVisible(false);
    } else {
      setModalVisible(false);
      if (modalCondition === "error") {
        setShowForm(true); // Show the form again if error modal is closed
      } else {
        window.location.reload(); // Refresh the page
      }
    }
  };

  const validateAge = (rule, value) => {
    const age = parseInt(value);
    if (isNaN(age) || age < 18 || age > 100) {
      return Promise.reject(
        "You must be between 18 and 100 years old to book an appointment."
      );
    } else {
      return Promise.resolve();
    }
  };

  return (
    <>
      <Modal
        title="Appointment:"
        visible={modalVisible}
        onOk={handleModalOk}
        okText="OK"
        okButtonProps={{ className: "bg-green-600 w-2/4 " }}
        cancelButtonProps={{ style: { display: "none" } }}
        closable
        className="mt-52"
      >
        <p>{modalMessage}</p>
      </Modal>
      <div>
        <Form
          labelCol={{
            span: 24,
          }}
          wrapperCol={{
            span: 24,
          }}
          layout="horizontal"
          style={{
            maxWidth: 1100,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="on"
          form={form}
        >
          <Row gutter={[10, 10]}>
            <Col span={8}>
              <Form.Item
                label="Patient Name"
                name="patientname"
                rules={[
                  {
                    required: true,
                    message: "Please input your Name!",
                  },
                ]}
              >
                <Input type="text" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Phone Number"
                name="contactno"
                rules={[
                  { required: true, message: "Please input your phone number" },
                  {
                    pattern: /^\+63\d{10}$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={3}>
              <Form.Item
                label="Age"
                name="age"
                rules={[
                  {
                    required: true,
                    message: "Please input your age!",
                  },
                  {
                    validator: validateAge,
                  },
                ]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={21}>
              <Form.Item
                label="Patient's Address"
                name="patientaddress"
                rules={[
                  {
                    required: true,
                    message: "Please input your address!",
                  },
                ]}
              >
                <Input.Group compact>
                  <Form.Item
                    name={["patientaddress", "street"]}
                    noStyle
                    rules={[{ required: true, message: "Street is required" }]}
                  >
                    <Input
                      style={{ width: "50%" }}
                      placeholder="House No. & Street"
                    />
                  </Form.Item>
                  <Form.Item
                    name={["patientaddress", "barangay"]}
                    noStyle
                    rules={[
                      { required: true, message: "Barangay is required" },
                    ]}
                  >
                    <Input style={{ width: "50%" }} placeholder="Barangay" />
                  </Form.Item>
                  <Form.Item
                    name={["patientaddress", "city"]}
                    noStyle
                    rules={[{ required: true, message: "City is required" }]}
                  >
                    <Input style={{ width: "50%" }} placeholder="City" />
                  </Form.Item>
                  <Form.Item
                    name={["patientaddress", "province"]}
                    noStyle
                    rules={[
                      { required: true, message: "Province is required" },
                    ]}
                  >
                    <Input style={{ width: "50%" }} placeholder="Province" />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
          </Row>
          <hr />
          <br />
          <Row gutter={[10, 10]}>
            <Col span={0} style={{ display: "none" }}>
              {" "}
              {/* Hide the column */}
              <Form.Item
                name="reasonforappointment"
                initialValue="consultation" // Set default value to "Consultation"
                hidden // Hide the Form.Item
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item
                label="Type of Doctor to Consult"
                rules={[{ required: true, message: "Select Type" }]}
                name="typedoctor"
              >
                <Select
                  options={typesofDoc}
                  style={{}}
                  placeholder="Select a type"
                  onChange={handleTypeChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[10, 10]}>
            <Col span={8}>
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
            </Col>

            <Col span={8}>
              <Form.Item
                name="timepicker"
                label="Appointment Time"
                rules={[{ required: true, message: "Select Time" }]}
              >
                <Select
                  options={
                    doctorTimeOptions[form.getFieldValue("typedoctor")] || []
                  }
                  style={{}}
                  placeholder="Select a time"
                  disabledDate={(current) => {
                    const currentTime = dayjs();
                    const selectedDate = form.getFieldValue("adate");
                    if (!selectedDate) return false; // If no date is selected, all times are enabled
                    const selectedTime = dayjs(selectedDate)
                      .set("hour", current.hour())
                      .set("minute", current.minute());
                    return currentTime.isAfter(selectedTime); // Disable times that have already passed
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                }}
                style={{
                  marginBottom: 5,
                }}
              >
                <Button
                  type="primary"
                  className="bg-green-600 w-2/4 "
                  htmlType="submit"
                  loading={buttonLoading} // Set loading state for the button
                  disabled={
                    doctorTimeOptions[form.getFieldValue("typedoctor")] &&
                    doctorTimeOptions[form.getFieldValue("typedoctor")]
                      .length === 0
                  }
                >
                  {" "}
                  Book Appointment
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default BookAppointmentForm;
