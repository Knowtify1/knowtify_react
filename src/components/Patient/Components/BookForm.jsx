import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Form, Input, Select, Space, Row, Col } from 'antd';
const { TextArea } = Input;
import { Timestamp } from 'firebase/firestore';
import { setDoc, doc, db, collection, addDoc, getDocs, query, where } from '../../../config/firebase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/en';

let referenceCounter = 0; // Initialize counter variable

const generateUniqueReference = () => {
  const prefix = 'AP';
  referenceCounter++; // Increment counter
  const referenceNumber = String(referenceCounter).padStart(7, '0'); // Ensure 7-digit format
  return `${prefix}${referenceNumber}`;
};

function BookForm() {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [availableDays, setAvailableDays] = useState([]);

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
    'Pediatrics': ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    // Add more types and their corresponding available days as needed
  };

   useEffect(() => {
    const selectedType = form.getFieldValue('type');
    setAvailableDays(doctorAvailability[selectedType] || []);
    // Additional logic to update available days as needed
  }, [form, doctorAvailability]);

  const handleTypeChange = (value) => {
    const selectedType = value;
    const timeOptions = doctorTimeOptions[selectedType] || [];
    form.setFieldsValue({
      timepicker: timeOptions.length > 0 ? timeOptions[0].value : null,
    });
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

  const disabledDate = async (current) => {
  const formattedDate = dayjs(current).format('YYYY-MM-DD');
  const selectedType = form.getFieldValue('type');
  const userEmailsCollection = collection(db, 'userEmails');

    const onFinish = async (values) => {
      const {
        email,
        patientname,
        contactno,
        age,
        patientaddress,
        reasonforappointment,
        type,
        adate,
        timepicker,
      } = values;

      // Store the email in Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const userEmailData = {
            email: user.email,
            createdDate: Timestamp.now(),
          };
          await addDoc(userEmailsCollection, userEmailData);
        }
      } catch (error) {
        console.log(error);
      }
    };

  return (
    // Disable past days
    current && current < dayjs().startOf('day') ||
    // Disable days based on doctor's availability
    !availableDays.includes(dayjs(current).format('dddd'))
  );
}


  // Custom validation rule for age field
  const validateAge = (rule, value) => {
    const age = parseInt(value);
    if (isNaN(age) || age < 18) {
      return Promise.reject('You must be at least 18 years old to book an appointment.');
    } else {
      return Promise.resolve();
    }
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
            ]}
          >
            <Input style={{ width: '100%' }} />
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
                {
                  validator: validateAge,
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
                  message: 'Please select or input your reason!',
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Select or Specify"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                allowClear
              >
                <Option value="consultation">Consultation</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.reasonforappointment !== currentValues.reasonforappointment
              }
            >
              {({ getFieldValue }) => {
                const selectedReason = getFieldValue('reasonforappointment');

                return selectedReason === 'other' ? (
                  <Form.Item
                    name="customReason"
                    rules={[
                      {
                        required: true,
                        message: 'Please specify your reason!',
                      },
                    ]}
                  >
                    <Input placeholder="Specify your reason" />
                  </Form.Item>
                ) : null;
              }}
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

export default BookForm;