import React, { useEffect, useState } from "react";
import { DatePicker, Input, Button, Form, message } from "antd";
import {
  doc,
  db,
  collection,
  addDoc,
  getDocs,
  where,
  query,
  fsTimeStamp,
  runTransaction,
  deleteDoc as deleteDocument,
} from "../../../config/firebase.jsx";

function CreateAppointment() {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { date, time, description } = values;

    // Convert date string to JavaScript Date object
    const selectedDate = new Date(date.format());

    // Create a new document in the "appointments" collection
    const appointmentsCollection = collection(db, "appointments");
    const toStringTime = time.toString();

    try {
      await addDoc(appointmentsCollection, {
        date: fsTimeStamp.fromDate(selectedDate), // Convert JavaScript Date to Firestore Timestamp
        toStringTime,
        description,
      });

      message.success("Appointment created successfully");
      form.resetFields();
    } catch (error) {
      console.error("Error adding document: ", error);
      message.error("Failed to create appointment");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="date"
          label="Appointment Date"
          rules={[
            { required: true, message: "Please select appointment date" },
          ]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item
          name="time"
          label="Appointment Time"
          rules={[{ required: true, message: "Please enter appointment time" }]}
        >
          <Input type="time" className="w-full" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter appointment description" },
          ]}
        >
          <Input className="w-full" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreateAppointment;
