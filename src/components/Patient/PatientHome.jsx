import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Space,
  DatePicker,
  Modal,
  Row,
  Col,
  Form,
} from "antd";
import {
  setDoc,
  doc,
  db,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "../../config/firebase";
import PatientOverview from "../Patient/Components/PatientOverview";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

function PatientHome() {
  const [reminders, setReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [remainingDays, setRemainingDays] = useState({});

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(updateRemainingDays, 1000 * 60); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const remindersSnapshot = await getDocs(collection(db, "reminders"));
      const fetchedReminders = remindersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: moment(doc.data().date.toDate()).format("YYYY-MM-DD"),
      }));
      setReminders(fetchedReminders);
      updateRemainingDays(fetchedReminders);
    } catch (error) {
      console.error("Error fetching reminders: ", error);
    }
  };

  const updateRemainingDays = (remindersList = reminders) => {
    const remainingDaysData = {};
    remindersList.forEach((reminder) => {
      const today = moment();
      const appointmentDate = moment(reminder.date);
      const diff = appointmentDate.diff(today, "days");
      remainingDaysData[reminder.id] = diff >= 0 ? diff : 0;
    });
    setRemainingDays(remainingDaysData);
  };

  const handleSave = async (values) => {
    try {
      const newReminder = {
        text: values.reminder,
        date: values.date.toDate(),
      };
      await addDoc(collection(db, "reminders"), newReminder);
      fetchReminders();
      form.resetFields();
    } catch (error) {
      console.error("Error adding reminder: ", error);
    }
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder);
    setModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const updatedReminder = {
        text: values.reminder,
        date: values.date.toDate(),
      };
      await updateDoc(
        doc(db, "reminders", editingReminder.id),
        updatedReminder
      );
      fetchReminders();
      setEditingReminder(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating reminder: ", error);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, "reminders", id));
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full text-center">
        <h3 className="text-3xl font-semibold pt-10">Overview</h3>{" "}
        <Space direction="vertical" size={20}>
          <Card
            className="pl-8 pr-4 pb-5 pt-2 custom-card"
            style={{ height: "auto" }}
          >
            <PatientOverview />
          </Card>
        </Space>
      </div>

      <div className="w-full mt-10">
        <Card title="Reminders">
          <Space direction="vertical" size={20}>
            <Space direction="horizontal">
              <Button
                type="success"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Add Reminder
              </Button>
            </Space>
            <Row gutter={[16, 16]}>
              {reminders.map((reminder) => (
                <Col key={reminder.id} span={8}>
                  <Card
                    style={{ marginBottom: "10px" }}
                    actions={[
                      <EditOutlined onClick={() => editReminder(reminder)} />,
                      <DeleteOutlined
                        onClick={() => deleteReminder(reminder.id)}
                      />,
                    ]}
                  >
                    <p>
                      <strong>{reminder.text}</strong>
                    </p>
                    <p>Date: {reminder.date}</p>
                    <p>Days Remaining: {remainingDays[reminder.id]}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Space>
        </Card>
      </div>

      <Modal
        title={editingReminder ? "Edit Reminder" : "Add Reminder"}
        visible={modalVisible}
        onCancel={() => {
          setEditingReminder(null);
          setModalVisible(false);
        }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="success"
            onClick={() => {
              form
                .validateFields()
                .then((values) => {
                  if (editingReminder) {
                    handleUpdate(values);
                  } else {
                    handleSave(values);
                  }
                })
                .catch((error) => {
                  console.error("Error validating fields: ", error);
                });
            }}
          >
            {editingReminder ? "Update Reminder" : "Add Reminder"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            reminder: editingReminder ? editingReminder.text : "",
            date: editingReminder ? moment(editingReminder.date) : moment(),
          }}
        >
          <Form.Item
            name="reminder"
            label="Reminder"
            rules={[{ required: true, message: "Please enter a reminder!" }]}
          >
            <Input placeholder="Enter a reminder" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select a date!" }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PatientHome;
