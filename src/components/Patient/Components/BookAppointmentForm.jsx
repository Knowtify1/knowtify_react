import React, { useState, useEffect } from "react";
import { Button, DatePicker, Form, Input, Select, Row, Col, Modal } from "antd";
import { Timestamp } from "firebase/firestore";
import {
  addDoc,
  collection,
  db,
  getDocs,
  query,
  where,
} from "../../../config/firebase";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

function BookAppointmentForm() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [availableDays, setAvailableDays] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [doctorAvailability, setDoctorAvailability] = useState({});
  const [doctorTimeOptions, setdoctorTimeOptions] = useState({});
  const [typesofDoc, settypesofDoc] = useState([]);
  const [submitButtonVisible, setSubmitButtonVisible] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "settings"));
        const availabilityData = {};
        const timeOptionsData = {};
        const specialtiesData = [];

        querySnapshot.forEach((doc) => {
          const specialty = doc.data().specialty;
          const specialtyLabel = doc.data().specialtyLabel;
          const days = doc.data().days || [];
          let times = doc.data().times || [];

          specialtiesData.push({ value: specialty, label: specialtyLabel });
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
    const { reference, typedoctor, adate, timepicker } = values;

    const appointmentDate = adate.startOf("day").toDate();
    const selectedTime = JSON.stringify(timepicker);

    const existingAppointmentsQuerySnapshot = await getDocs(
      query(
        collection(db, "appointments"),
        where("reference", "==", reference),
        where("typeOfDoctor", "==", typedoctor),
        where("appointmentDate", "==", appointmentDate),
        where("appointmentTime", "==", selectedTime)
      )
    );

    const numExistingAppointments = existingAppointmentsQuerySnapshot.size;
    if (numExistingAppointments >= 4) {
      const message =
        "There are already 4 appointments booked for the selected date and time. Please choose a different Time.";
      setModalMessage(message);
      showModal();
    } else {
      try {
        const userData = {
          createdDate: Timestamp.now(),
          reference: reference,
          typeOfDoctor: typedoctor,
          appointmentDate: appointmentDate,
          appointmentTime: selectedTime,
          approved: false,
          assignedDoctor: "",
          status: "pending",
        };

        await addDoc(collection(db, "appointments"), userData);
        setSubmitButtonVisible(false);
        showModal();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const handleModalOk = () => {
    setModalVisible(false);
    if (!submitButtonVisible) {
      form.resetFields();
      setSubmitButtonVisible(true);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Modal
        title="Message"
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p>{modalMessage}</p>
      </Modal>
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
        autoComplete="off"
        form={form}
      >
        <Row gutter={[10, 10]}>
          <Col span={24}>
            <Form.Item
              label="Reference"
              name="reference"
              rules={[
                {
                  required: true,
                  message: "Please provide your reference!",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
          </Col>
        </Row>
        <hr />
        <br />
        <Row gutter={[10, 10]}>
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
              {submitButtonVisible && (
                <div className="flex flex-col ...">
                  <Button type="success" htmlType="submit">
                    Submit
                  </Button>
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default BookAppointmentForm;
