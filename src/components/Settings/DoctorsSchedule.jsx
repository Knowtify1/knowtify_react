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
  { value: "Orthopedics", label: "General Orthopedics Surgery" },
  {
    value: "Internal Medicine",
    label: "Internal Medicine",
  },
  {
    value: "Hematology",
    label: "Internal Medicine (Adult Hematology)",
  },
  {
    value: "Infectious",
    label: "Internal Medicine (Infectious Diseases)",
  },
  {
    value: "Pulmonology",
    label: "Internal Medicine (Pulmonology)",
  },
  {
    value: "Ob",
    label: "Obstetrics and Gynecology",
  },
  {
    value: "Pediatrics",
    label: "Pediatrics, Vaccines, and Immunizations",
  },
  {
    value: "Physical",
    label: "Physical Medicine and Rehabilitation",
  },
];

const DoctorsSchedule = () => {
  const [formKey, setFormKey] = useState(0); // Add state for form key
  const [form] = Form.useForm();
  const [selectedOption, setSelectedOption] = useState(undefined);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [checkedDays, setCheckedDays] = useState([]);
  const [checkedTimes, setCheckedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [doctorName, setDoctorName] = useState("");

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
              setIsDoctor(true);
              const name = doctorSnapshot.data().name;
              if (name) {
                setDoctorName(name);
              } else {
                console.log("Doctor's name not found in Firestore document.");
              }
            } else {
              console.log("No such document!");
              setIsDoctor(false);
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
    const { option } = values;
    const specialtytrim = option?.replace(/\s/g, "");

    if (option && checkedDays.length > 0 && checkedTimes.length > 0) {
      const selectedLabel = typesofDoc.find(
        (doc) => doc.value === option
      )?.label;
      const doctorSpecialtyLabel = ` - ${selectedLabel}`;

      const data = {
        specialty: option,
        specialtyLabel: doctorSpecialtyLabel,
        days: checkedDays,
        times: checkedTimes,
      };
      try {
        await setDoc(doc(db, "settings", specialtytrim + "_schedules"), data);
        console.log("Data successfully stored in Firestore!");

        setSelectedDays(checkedDays);
        setSelectedTimes(checkedTimes);

        message.success("Form submitted successfully!");
        form.resetFields();
        setFormKey((prevKey) => prevKey + 1); // Update form key to reset the form
      } catch (error) {
        console.error("Error storing data in Firestore: ", error);
        message.error("Failed to submit form.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error("One or more values are missing.");
      message.error("Failed to submit form. One or more values are missing.");
      setIsSubmitting(false);
    }
  };

  const handleSpecialtyChange = (value) => {
    setSelectedOption(value);
    setCheckedDays([]); // Reset checkedDays
    setCheckedTimes([]); // Reset checkedTimes
  };

  const handleDayChange = (checkedValues) => {
    setCheckedDays(checkedValues);
  };

  const handleTimeChange = (checkedValues) => {
    setCheckedTimes(checkedValues);
  };

  const checkAllDays = () => {
    if (checkedDays.length === daysSlots.length) {
      setCheckedDays([]); // If all days are checked, uncheck all
    } else {
      setCheckedDays([...daysSlots]); // Otherwise, check all
    }
  };

  const checkAllTimes = () => {
    if (checkedTimes.length === timeSlots.length) {
      setCheckedTimes([]); // If all times are checked, uncheck all
    } else {
      setCheckedTimes([...timeSlots]); // Otherwise, check all
    }
  };

  return (
    <>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Doctors Schedules
      </h1>
      <Spin spinning={loading}>
        <Form
          key={formKey}
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            option: selectedOption,
            days: [],
            times: [],
          }}
        >
          <Form.Item
            name="option"
            label="Select Specialties"
            rules={[{ required: true, message: "Please select an option" }]}
          >
            <Select disabled={isDoctor} onChange={handleSpecialtyChange}>
              {typesofDoc.map((doc) => (
                <Option key={doc.value} value={doc.value}>
                  {`${doc.label} - ${doctorName}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
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
                <Button type="link" onClick={checkAllDays}>
                  Select All
                </Button>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="times" label="Select Times">
                <Checkbox.Group
                  onChange={handleTimeChange}
                  value={checkedTimes}
                >
                  <Row>
                    {timeSlots.map((slot) => (
                      <Col span={24} key={slot}>
                        <Checkbox value={slot}>{slot}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
                <Button type="link" onClick={checkAllTimes}>
                  Select All
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600"
              disabled={isSubmitting}
              block
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
