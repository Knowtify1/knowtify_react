import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, Row, Col } from 'antd';
const { TextArea } = Input;
import { Timestamp } from 'firebase/firestore';
import { setDoc, doc, db, collection, addDoc, getDoc, query, where } from '../../config/firebase';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/en';

const FollowUp = () => {
  const [componentDisabled, setComponentDisabled] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [existingAppointments, setExistingAppointments] = useState([]);

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
            reference: doc.data().reference,
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
    const { referenceId } = values;

    try {
      // Fetch details based on referenceId
      const appointmentDocRef = doc(db, 'appointments', referenceId);
      const appointmentDoc = await getDoc(appointmentDocRef);

      if (appointmentDoc.exists()) {
        const appointmentData = appointmentDoc.data();
        // Use appointmentData to auto-fill the form
        form.setFieldsValue({
          patientname: appointmentData.patientName,
          contactno: appointmentData.contactNo,
          age: appointmentData.age,
          patientaddress: appointmentData.patientAddress,
          reasonforappointment: appointmentData.reasonForAppointment,
          type: appointmentData.typeOfDoctor,
          adate: dayjs(appointmentData.appointmentDate.toDate()),
          timepicker: JSON.parse(appointmentData.appointmentTime).value,
        });

        navigate('/apointment'); // Replace with your actual route for the booking form
      } else {
        console.log('Appointment not found');
      }
    } catch (error) {
      console.error("Error fetching appointment details", error);
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
        autoComplete="off"
        form={form}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Reference ID"
              name="referenceId"
              rules={[
                {
                  required: true,
                  message: 'Please input your Reference ID!',
                },
              ]}
            >
              <Input type="text" />
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

export default FollowUp;
