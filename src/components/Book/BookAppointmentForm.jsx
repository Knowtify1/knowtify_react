import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Form, Input, Select, Space, Row, Col } from 'antd';
const { TextArea } = Input;
import { Timestamp } from 'firebase/firestore';
import { setDoc, doc, db, collection, addDoc, getDocs, query, where } from '../../config/firebase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/en';

const generateUniqueReference = () => {
  const prefix = 'AP';
  const randomDigits = Math.floor(Math.random() * 10000000); // Generates a random 7-digit number

  return `${prefix}${randomDigits}`;
};

function BookAppointmentForm() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [availableDays, setAvailableDays] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);


  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }} defaultValue={'+63'}>
      </Select>
    </Form.Item>
  );

  const config = {
    rules: [
      {
        type: 'object',
        required: true,
        message: 'Please select time!',
      },
    ],
  };

  const doctorTimeOptions = {
    'Orthopedics': [
      { value: '8:00', label: '8:00 AM' },
      { value:  '9:00',  label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00', label: '1:00 PM' },
      { value: '2:00', label: '2:00 PM' },
      { value: '3:00',  label: '3:00 PM' },
    ],
    'Internal Medicine': [
      { value: '3:00',  label: '3:00 PM' },
      { value: '4:00',  label: '4:00 PM' },
    ],
    'Hematology': [
      { value: '1:00',  label: '1:00 PM' },
      { value: '2:00',  label: '2:00 PM' },
      { value: '3:00', label: '3:00 PM' },
      { value: '4:00',  label: '4:00 PM' },
    ],
    'Infectious': [
      { value:  '9:00',  label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00',  label: '1:00 PM' },
      { value: '2:00',  label: '2:00 PM' },
      { value: '3:00',  label: '3:00 PM' },
    ],
    'Pulmonology': [
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00',  label: '1:00 PM' },
    ],
    'Ob': [
      { value: '8:00', label: '8:00 AM' },
      { value:  '9:00',  label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00', label: '1:00 PM' },
      { value: '2:00', label: '2:00 PM' },
      { value: '3:00',  label: '3:00 PM' },
    ],
    'Pediatrics': [
      { value:  '9:00',  label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00',  label: '1:00 PM' },
    ],
    'Physical': [
      { value: '8:00', label: '8:00 AM' },
      { value:  '9:00',  label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
      { value: '1:00', label: '1:00 PM' },
      { value: '2:00', label: '2:00 PM' },
      { value: '3:00',  label: '3:00 PM' },

    ],
  };

  const typesofDoc = [
    { value: 'Orthopedics', label: 'General Orthopaedic Surgery' },
    { value: 'Internal Medicine', label: 'Internal Medicine' },
    { value: 'Hematology', label: 'Internal Medicine (Adult Hematology)' },
    { value: 'Infectious', label: 'Internal Medicine (Infectious Diseases)' },
    { value: 'Pulmonology', label: 'Internal Medicine (Pulmonology)' },
    { value: 'Ob', label: 'Obstetrics and Gynecology' },
    { value: 'Physical', label: 'Physical Medicine and Rehabilitation' },
    { value: 'Pediatrics', label: 'Pediatrics, Vaccines, and Immunizations' },
  ];

  const doctorAvailability = {
  'Orthopedics': ['Monday', 'Tuesday', 'Thursday'],
  'Internal Medicine': ['Monday', 'Wednesday', 'Thursday'],
  'Hematology': ['Monday', 'Wednesday', 'Friday'],
  'Infectious': ['Wednesday', 'Friday', 'Saturday'],
  'Pulmonology': ['Tuesday', 'Thursday'],
  'Ob': ['Monday', 'Tuesday' ],
  'Physical': ['Tuesday', 'Thursday'],
  'Pediatrics': ['Monday', 'Wednesday', 'Friday',, 'Saturday'],
  
  // Add more types and their corresponding available days as needed
  };
  useEffect(() => {
    const selectedType = form.getFieldValue('type');
    setAvailableDays(doctorAvailability[selectedType] || []);
    // Additional logic to update available days as needed
  }, [form, doctorAvailability]);


  useEffect(() => {
  const selectedType = form.getFieldValue('type');
  const timeOptions = doctorTimeOptions[selectedType] || [];
  }, [doctorTimeOptions]);

const handleTypeChange = (value) => {
  const selectedType = value;
  const timeOptions = doctorTimeOptions[selectedType] || [];
  form.setFieldsValue({
    timepicker: timeOptions.length > 0 ? timeOptions[0].value : null,
  });
  };

useEffect(() => {
    const fetchExistingAppointments = async () => {
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("approved", "==", true));
        const querySnapshot = await getDocs(q);

        const appointments = [];
        querySnapshot.forEach((doc) => {
          appointments.push({
            date: dayjs(doc.data().appointmentDate.toDate()).format("YYYY-MM-DD"),
            time: JSON.parse(doc.data().appointmentTime).value,
          });
        });

        setExistingAppointments(appointments);
      } catch (error) {
        console.error("Error fetching existing appointments", error);
      }
    };

    fetchExistingAppointments();
  }, []);

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

  const appointmentDate = new Date(adate);
  const selectedTime = JSON.stringify(timepicker);

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
      assignedDoctor: '',
      status: 'pending',
      reference: uniqueReference,
    };

    const myDoc = collection(db, 'appointments');

    try {
      const docref = await addDoc(myDoc, userData);
      console.log('firestore success');
      console.log('document id', docref);

      navigate('/appointmentsuccess', { state: { appointmentID: docref.id } });
    } catch (error) {
      console.log(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const disabledDate = (current) => {
  const formattedDate = dayjs(current).format('YYYY-MM-DD');
  const isBookedDate = existingAppointments.some(
    (appointment) => appointment.date === formattedDate
  );

  return (
    // Disable past days
    current && current < dayjs().startOf('day') ||
    // Disable days based on doctor's availability
    !availableDays.includes(dayjs(current).format('dddd')) ||
    // Disable dates that have already been booked
    isBookedDate
  );
};

const disabledTime = (current, type) => {
  const selectedDate = form.getFieldValue('adate');
  const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
  const isBookedTime = existingAppointments.some(
    (appointment) =>
      appointment.date === formattedDate &&
      appointment.time === JSON.stringify(current)
  );

  return (
    // Disable times that have already been booked for the selected date
    isBookedTime
  );
};

  return (
    <>
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
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item
              label="Patient Name"
              name="patientname"
              rules={[
                {
                  required: true,
                  message: 'Please input your Name!',
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Contact Number"
              name="contactno"
              rules={[
                {
                  required: true,
                  message: 'Please input your number',
                },
                {
                  pattern: /^(\+?63|0)?9\d{9}$/,
                  message: 'Please enter a valid Philippine phone number',
                },
              ]}
            >
              <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Age"
              name="age"
              rules={[
                {
                  required: true,
                  message: 'Please input your age!',
                },
              ]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item
              label="Patient's Address"
              name="patientaddress"
              rules={[
                {
                  required: true,
                  message: 'Please input your address!',
                },
              ]}
            >
              <TextArea rows={2} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Reason for Appointment"
              name="reasonforappointment"
              rules={[
                {
                  required: true,
                  message: 'Please input your reason!',
                },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Type of Doctor to Consult"
              rules={[{ required: true, message: 'Select Type' }]}
              name="type"
            >
              <Select options={typesofDoc} style={{}} placeholder="Select a type" onChange={handleTypeChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item
              label="Appointment Date"
              rules={[{ required: true, message: 'Select Date' }]}
              name="adate"
            >
              <DatePicker
                disabledDate={(current) => {
                  // Disable past days
                  if (current && current < dayjs().startOf('day')) {
                    return true;
                  }

                  // Disable days based on doctor's availability
                  const dayOfWeek = current.day();
                  return !availableDays.includes(dayjs().day(dayOfWeek).format('dddd'));
                }}
                placeholder="Select Date"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
          <Form.Item
            name="timepicker"
            label="Appointment Time"
            {...config}
            rules={[{ required: true, message: 'Select Time' }]}
          >
            <Select
              options={doctorTimeOptions[form.getFieldValue('type')] || []}
              style={{}}
              placeholder="Select a time"
              disabledDate={(current) => disabledTime(current, form.getFieldValue('type'))}
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
                <Button type="primary" className="bg-green-600 w-2/4 " htmlType="submit">
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default BookAppointmentForm;