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
} from "antd";
const { TextArea } = Input;
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

const generateUniqueReference = () => {
  const prefix = "AP";
  const randomDigits = Math.floor(Math.random() * 10000000); // Generates a random 7-digit number
  return `${prefix}${randomDigits}`;
};

const BookAppointmentForm = () => {
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
  const [patientDetails, setPatientDetails] = useState({});

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

          // Sort times into two ranges: 7:00 - 12:00 and 1:00 - 8:00
          times = times.sort((a, b) => {
            const hourA = parseInt(a.split(":")[0]);
            const hourB = parseInt(b.split(":")[0]);

            if (hourA >= 7 && hourA < 12 && hourB >= 7 && hourB < 12) {
              return hourA - hourB;
            } else if (hourA >= 7 && hourA < 12) {
              return -1;
            } else if (hourB >= 7 && hourB < 12) {
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

    const datePart = adate.startOf("day");
    const appointmentDate = datePart.toDate();

    const selectedTime = JSON.stringify(timepicker);
    const uniqueReference = generateUniqueReference();

    const existingAppointmentsQuerySnapshot = await getDocs(
      query(
        collection(db, "appointments"),
        where("appointmentDate", "==", appointmentDate),
        where("typeOfDoctor", "==", typedoctor),
        where("appointmentTime", "==", selectedTime)
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
        appointmentTime: timepicker,
        approved: false,
        assignedDoctor: "",
        status: "pending",
        reference: uniqueReference,
      };

      navigate("/appointmentsuccess", {
        state: { appointmentData: userData, phone: contactno },
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
      setModalVisible(false);
    } else {
      setModalVisible(false);
    }
  };

  return (
    <>
      <Modal
        title="Error:"
        visible={modalVisible}
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
            span: 24,
          }}
          wrapperCol={{
            span: 24,
          }}
          layout="horizontal"
          disabled={componentDisabled}
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
            <Col span={8}>
              <Form.Item
                label="Reason for Appointment"
                name="reasonforappointment"
                rules={[
                  {
                    required: true,
                    message: "Please select or input your reason!",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Select or Specify"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  allowClear
                >
                  <Select.Option value="consultation">
                    Consultation
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
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
