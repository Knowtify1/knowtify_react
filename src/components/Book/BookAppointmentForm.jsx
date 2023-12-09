import React, { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  TimePicker,
  Space,
} from "antd";
const { TextArea } = Input;
import { Timestamp } from "firebase/firestore";
import { setDoc, doc, db, collection, addDoc } from "../../config/firebase";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import 'dayjs/locale/en';

const generateUniqueReference = () => {
  const prefix = "AP";
  const randomDigits = Math.floor(Math.random() * 10000000); // Generates a random 7-digit number

  return `${prefix}${randomDigits}`;
};

function BookAppointmentForm() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }} defaultValue={"+63"}>
        <Select.Option value="+1">+1</Select.Option>
      </Select>
    </Form.Item>
  );

  const config = {
    rules: [
      {
        type: "object",
        required: true,
        message: "Please select time!",
      },
    ],
  };

  const onFinish = async (values) => {
    const {
      patientname,
      contactno,
      age,
      patientaddress,
      reasonforappointment,
      type,
      adate,
      timepicker,
    } = values;

    //console.log("atime", timepicker);

    //Formatting date
    // const putdatetostring = adate.toISOString();
    // const datePart = putdatetostring.split("T")[0];
    // const appointmentDate = new Date(datePart); //create object Date
    const appointmentDate = new Date(adate); //create object Date

    //const hour = timepicker.getHour;

    //console.log("aDate", datePart);

    const uniqueReference = generateUniqueReference();

    const userData = {
      createdDate: Timestamp.now(),
      patientName: patientname,
      contactNo: contactno,
      age: age,
      patientAddress: patientaddress,
      reasonForAppointment: reasonforappointment,
      typeOfDoctor: type,
      appointmentDate: appointmentDate,
      appointmentTime: JSON.stringify(timepicker),
      approved: false,
      assignedDoctor: "",
      status: "pending",
      reference: uniqueReference,
    };

    const myDoc = collection(db, "appointments");

    try {
      const docref = await addDoc(myDoc, userData);
      console.log("firestore success");
      console.log("document id", docref);

      // Navigate to another page with state
      navigate("/appointmentsuccess", { state: { appointmentID: docref.id } });
    } catch (error) {
      console.log(error);
    }

    //console.log("Values:", timepicker);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onChange = (time, timeString) => {
    console.log(time, timeString);
  };


  const format = "HH";
  const options = [
    { value: "8:00", label: "8:00 AM" },
    { value: "9:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 AM" },
    { value: "1:00", label: "1:00 PM" },
    { value: "2:00", label: "2:00 PM" },
    { value: "3:00", label: "3:00 PM" },
    { value: "4:00", label: "4:00 PM" },
  ];

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

  return (
    <>
      <Form
        labelCol={{
          span: 8, // Adjusted span for labels
        }}
        wrapperCol={{
          span: 16, // Adjusted span for form controls
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
      >
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
        <Form.Item
          label="Contact Number"
          name="contactno"
          rules={[
            {
              required: true,
              message: "Please input your number",
            },
          ]}
        >
          <Input addonBefore={prefixSelector} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Age"
          name="age"
          rules={[
            {
              required: true,
              message: "Please input your age!",
            },
          ]}
        >
          <Input type="number" />
        </Form.Item>
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
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item
          label="Reason for Appointment"
          name="reasonforappointment"
          rules={[
            {
              required: true,
              message: "Please input your reason!",
            },
          ]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          label="Type of Doctor to Consult"
          rules={[{ required: true, message: "Select Type" }]}
          name="type"
        >
          <Select options={typesofDoc} style={{}} placeholder="select a type" />
        </Form.Item>

        <Form.Item
          label="Appointment Date"
          rules={[{ required: true, message: "Select Date" }]}
          name="adate"
        >
          <DatePicker disabledDate={(current) => current && current < dayjs().startOf('day')} />
        </Form.Item>

        <Form.Item
          name="timepicker"
          label="Appointment Time"
          {...config}
          rules={[{ required: true, message: "Select Time" }]}
        >
          <Select options={options} style={{}} placeholder="select a time" />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8, // Adjusted offset for the button
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
            >
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
}

export default BookAppointmentForm;
