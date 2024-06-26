import React, { useState, useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Row,
  Col,
  Modal,
  Card,
} from "antd";
const { TextArea } = Input;
import { Timestamp } from "firebase/firestore";
import {
  setDoc,
  doc,
  db,
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

const generateUniqueReference = () => {
  const prefix = "AP";
  const randomDigits = Math.floor(Math.random() * 10000000); // Generates a random 7-digit number
  return `${prefix}${randomDigits}`;
};

function BookAppointmentForm() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [availableDays, setAvailableDays] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalClosable, setModalClosable] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalCondition, setModalCondition] = useState("");

  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setdoctorTimeOptions] = useState({});
  const [typesofDoc, settypesofDoc] = useState([]);

  const [buttonLoading, setButtonLoading] = useState(false); // State to manage button loading state
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

    setAvailableDays(doctorAvailability[selectedType] || []);
  };

  const onFinish = async (values) => {
    const {
      patientname,
      contactno,
      birthdate,
      gender,
      patientaddress,
      reasonforappointment,
      typedoctor,
      adate,
      timepicker,
    } = values;

    // Calculate age from birthdate
    const birthDate = dayjs(birthdate);
    const age = dayjs().diff(birthDate, "year");

    const datePart = adate.startOf("day");
    const appointmentDate = datePart.toDate();

    const selectedTime = JSON.stringify(timepicker);
    const uniqueReference = generateUniqueReference();

    // Concatenate the prefix and the contact number input
    const prefixedContactNo = "+63" + contactno;

    const patientQuerySnapshot = await getDocs(
      query(
        collection(db, "appointments"),
        where("patientName", "==", patientname),
        where("contactNo", "==", prefixedContactNo)
      )
    );

    if (!patientQuerySnapshot.empty) {
      const message =
        "Patient with the same name and phone number already exists!";
      setModalClosable(false);
      setModalCondition("exists");
      setModalMessage(message);
      showModal();
      return;
    }

    const existingAppointmentsQuerySnapshot = await getDocs(
      query(
        collection(db, "appointments"),
        where("appointmentDate", "==", appointmentDate),
        where("typeOfDoctor", "==", typedoctor),
        where("appointmentTime", "==", selectedTime)
      )
    );

    const numExistingAppointments = existingAppointmentsQuerySnapshot.size;

    if (numExistingAppointments >= 2) {
      const message =
        "There are already 2 appointments booked for the selected date and time. Please choose a different Time.";
      setModalClosable(false);
      setModalCondition("schedexists");
      setModalMessage(message);
      showModal();
    } else {
      // Disable the submit button to prevent multiple submissions
      setButtonLoading(true);

      const userData = {
        createdDate: Timestamp.now(),
        patientName: patientname,
        contactNo: prefixedContactNo, // Save the concatenated contact number
        age: age,
        patientAddress: patientaddress,
        reasonForAppointment: reasonforappointment,
        typeOfDoctor: typedoctor,
        appointmentDate: appointmentDate,
        appointmentTime: JSON.stringify(timepicker),
        gender: gender, // Add gender to userData
        approved: false,
        assignedDoctor: "",
        status: "pending",
        reference: uniqueReference,
      };
      navigate("/appointmentsuccess", {
        state: { appointmentData: userData, phone: prefixedContactNo },
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
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

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    if (modalCondition === "exists") {
      navigate("/login");
    } else if (modalCondition === "schedexists") {
      setButtonLoading(false); // Enable the submit button again
      setModalVisible(false);
    } else {
      setModalVisible(false);
    }
  };

  return (
    <>
      <Modal
        title="Error:"
        open={modalVisible}
        onOk={handleModalOk}
        okText="OK"
        okButtonProps={{ className: "bg-green-600 w-2/4 " }}
        cancelButtonProps={{ style: { display: "none" } }}
        closable={modalClosable}
        className="mt-52"
      >
        <p>{modalMessage}</p>
      </Modal>
      <div>
        <Form
          labelCol={{
            span: 30,
          }}
          wrapperCol={{
            span: 30,
          }}
          layout="horizontal"
          disabled={componentDisabled}
          style={{
            maxWidth: 1300,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Row gutter={[10, 10]}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="Birthdate"
                name="birthdate"
                rules={[
                  {
                    required: true,
                    message: "Please select your birthdate!",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) => {
                    // Disable dates for which the user would be less than 18 years old
                    return (
                      current &&
                      current >= dayjs().subtract(18, "year").endOf("day")
                    );
                  }}
                  placeholder="Select Date"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="contactno"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number",
                  },
                  {
                    message:
                      "Please enter a valid phone number starting with +63",
                  },
                ]}
              >
                <Input.Group compact>
                  <Input style={{ width: "25%" }} value="+63" readOnly />
                  <Form.Item
                    name={["contactno"]}
                    noStyle
                    rules={[
                      { required: true, message: "Phone number is required" },
                      {
                        pattern: /^\d{10}$/, // Updated pattern to match exactly 9 digits
                        message: "Please enter a valid 10-digit phone number",
                      },
                    ]}
                  >
                    <Input
                      style={{ width: "75%" }}
                      placeholder="Enter your phone number"
                    />
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[
                  {
                    required: true,
                    message: "Please select your gender!",
                  },
                ]}
              >
                <Select placeholder="Select Gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
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
            <Col span={24}>
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
            <Col span={12}>
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
            <Col span={12}>
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
                  disabledTime={(current) => {
                    const selectedDate = form.getFieldValue("adate");
                    if (!selectedDate) return false; // If no date is selected, all times are enabled

                    const currentTime = dayjs();
                    const selectedTime = dayjs(selectedDate)
                      .set("hour", current.hour())
                      .set("minute", current.minute());

                    const isToday = dayjs(selectedDate).isSame(
                      currentTime,
                      "date"
                    );

                    // Disable times that have already passed if the selected date is today
                    if (isToday && selectedTime.isBefore(currentTime)) {
                      return {
                        disabledHours: () =>
                          current.hour() < currentTime.hour(),
                        disabledMinutes: (selectedHour) =>
                          selectedHour === currentTime.hour()
                            ? current.minute() <= currentTime.minute()
                            : false,
                      };
                    }
                    return {};
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
                <div className="flex flex-col ...">
                  <Button
                    type="primary"
                    className="bg-green-600 w-2/4 "
                    htmlType="submit"
                    loading={buttonLoading} // Set loading state for the button
                    disabled={buttonLoading} // Disable the button if loading
                  >
                    Submit
                  </Button>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}

export default BookAppointmentForm;
