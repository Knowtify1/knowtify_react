import React, { useState, useEffect } from "react";
import { Form, Select, Checkbox, Button, Row, Col, Spin, message } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "../../config/firebase.jsx";

const { Option } = Select;

const timeSlots = [
  "7:00",
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "1:00",
  "2:00",
  "3:00",
  "4:00",
  "5:00",
];

const daysSlots = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const typesofDoc = [
  { value: "Orthopedics", label: "General Orthopaedic Surgery" },
  { value: "Internal Medicine", label: "Internal Medicine" },
  { value: "Hematology", label: "Internal Medicine (Adult Hematology)" },
  { value: "Infectious", label: "Internal Medicine (Infectious Diseases)" },
  { value: "Pulmonology", label: "Internal Medicine (Pulmonology)" },
  { value: "Ob", label: "Obstetrics and Gynecology" },
  { value: "Physical", label: "Physical Medicine and Rehabilitation" },
  { value: "Pediatrics", label: "Pediatrics, Vaccines, and Immunizations" },
];

const DoctorsSchedule = () => {
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState(undefined);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [checkedDays, setCheckedDays] = useState([]);
  const [checkedTimes, setCheckedTimes] = useState([]);
  const [loading, setLoading] = useState(true); // Initially set loading to true
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
  const [isDoctor, setIsDoctor] = useState(false); // State to track if the user is a doctor

  useEffect(() => {
    const fetchUserSpecialty = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const docRef = doc(db, "doctors_accounts", userId);

          try {
            const doctorSnapshot = await getDoc(docRef);

            if (doctorSnapshot.exists()) {
              const specialty = doctorSnapshot.data()?.specialty;

              setSelectedOption(specialty);
              fetchScheduleData(specialty);
              setIsDoctor(true); // Set isDoctor to true if user is a doctor
            } else {
              console.log("No such document!");
              setIsDoctor(false); // Set isDoctor to false if user is not a doctor
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          } finally {
            setLoading(false);
          }
        }
      });

      return () => unsubscribe();
    };

    fetchUserSpecialty();
  }, []);

  const fetchScheduleData = async (selectedOption) => {
    setLoading(true);
    const q = query(
      collection(db, "settings"),
      where("specialty", "==", selectedOption)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      setSelectedDays(data.days);
      setSelectedTimes(data.times);
      form.setFieldsValue({
        option: data.specialty,
        days: data.days,
        times: data.times,
      });
      setCheckedDays(data.days);
      setCheckedTimes(data.times);
    });
    setLoading(false);
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    console.log("Received values:", values);
    const { option, days, times } = values;
    const specialtytrim = option.replace(/\s/g, "");

    const selectedLabel = typesofDoc.find((doc) => doc.value === option)?.label;
    // Prepare data for Firestore
    const data = {
      specialty: option,
      specialtyLabel: selectedLabel,
      days: days,
      times: times,
    };
    try {
      // Add data to Firestore
      await setDoc(doc(db, "settings", specialtytrim + "_schedules"), data);
      console.log("Data successfully stored in Firestore!");

      // Update selected days and times based on the submitted form values
      setSelectedDays(days);
      setSelectedTimes(times);

      // Show success message
      message.success("Form submitted successfully!");
      // Reset form fields after successful submission
      form.resetFields();
    } catch (error) {
      console.error("Error storing data in Firestore: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayChange = (checkedValues) => {
    setCheckedDays(checkedValues);
  };

  const handleTimeChange = (checkedValues) => {
    setCheckedTimes(checkedValues);
  };

  return (
    <>
      <h1>Doctors Schedules</h1>
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            option: selectedOption,
            days: selectedDays,
            times: selectedTimes,
          }}
        >
          <Form.Item
            name="option"
            label="Select Specialties"
            rules={[{ required: true, message: "Please select an option" }]}
          >
            <Select disabled={isDoctor}>
              {" "}
              {/* Disable the select if user is a doctor */}
              {typesofDoc.map((doc) => (
                <Option key={doc.value} value={doc.value}>
                  {doc.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="days" label="Select Days">
            <Checkbox.Group onChange={handleDayChange} value={checkedDays}>
              <Row>
                {daysSlots.map((day) => (
                  <Col span={24} key={day}>
                    <Checkbox value={day}>{day}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item name="times" label="Select Times">
            <Checkbox.Group onChange={handleTimeChange} value={checkedTimes}>
              <Row>
                {timeSlots.map((slot) => (
                  <Col span={24} key={slot}>
                    <Checkbox value={slot}>{slot}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600 w-2/4"
              disabled={isSubmitting} // Disable button while submitting
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};

export default DoctorsSchedule;
