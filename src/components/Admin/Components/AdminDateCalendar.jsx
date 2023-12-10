import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Select,
  Card,
  Space,
  Spin,
  List,
  DatePicker,
  notification,
  Calendar,
  theme,
} from "antd";
import moment from "moment";
import {
  collection,
  getDocs,
  where,
  query,
  db,
} from "../../../config/firebase.jsx";

const { Option } = Select;

const AdminDateCalendar = () => {
  const location = useLocation();
  const { specialty } = location.state || {};

  const [doctorsData, setDoctorsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredPatientsData, setFilteredPatientsData] = useState([]);

  const { token } = theme.useToken();
  const wrapperStyle = {
    width: 400,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doctorsCollection = collection(db, "doctors");
        const q = query(doctorsCollection, where("specialty", "==", specialty));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDoctorsData(data);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [specialty]);

  const handleSelectChange = async (value) => {
    setSelectedDoctor(value);

    try {
      setLoading(true);
      const patientsCollection = collection(db, "patients");
      const patientsQuery = query(
        patientsCollection,
        where(
          "typeOfDoctor",
          "==",
          doctorsData.find((doctor) => doctor.id === value)?.specialty
        ),
        where("status", "==", "assigned"),
        where(
          "assignedDoctor",
          "==",
          doctorsData.find((doctor) => doctor.id === value)?.name
        )
      );

      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientsData(patientsData);
    } catch (error) {
      console.error("Error fetching patient data from Firebase:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch patient data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (value) => {
    const selectedDateString = value.format("YYYY-MM-DD");
    console.log("Selected Date:", selectedDateString);
    setSelectedDate(value);

    // Filter patientsData based on the selected date
    const filteredPatients = patientsData.filter(
      (patient) =>
        moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
        selectedDateString
    );

    // Update the state with filtered patients
    setFilteredPatientsData(filteredPatients);

    if (filteredPatients.length === 0) {
      notification.error({
        message: "No Appointments",
        description: "No appointments found for the selected date.",
      });
    }
  };

  return (
    <>
      <Card
        title={`Calendar - ${specialty || "No Specialty Selected"}`}
        style={{ width: "100%" }}
      >
        <Space direction="horizontal" size={30}>
          <Select
            style={{ width: "200px" }}
            placeholder="Select a doctor"
            onChange={handleSelectChange}
            disabled={loading}
          >
            {doctorsData.map((doctor) => (
              <Option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </Option>
            ))}
          </Select>

          {loading ? (
            <Spin size="small" />
          ) : selectedDoctor ? (
            <Space direction="horizontal" size={30}>
              <p>
                Calendar for:{" "}
                {doctorsData.find((doc) => doc.id === selectedDoctor)?.name}
              </p>
              <p>
                Specialty:{" "}
                {
                  doctorsData.find((doc) => doc.id === selectedDoctor)
                    ?.specialty
                }
              </p>
            </Space>
          ) : null}
        </Space>
        {selectedDoctor && (
          <Card>
            <Space direction="horizontal" size={10}>
              <div style={wrapperStyle}>
                <Calendar fullscreen={false} onSelect={onSelect} />
              </div>

              <Card>
                <List
                  dataSource={filteredPatientsData}
                  renderItem={(item) => (
                    <List.Item>
                      <Space direction="vertical" size={10}>
                        <p>Patient Name: {item.patientName}</p>
                        <p>
                          Appointment Date:{" "}
                          {moment(item.appointmentDate.toDate()).format(
                            "MMMM Do YYYY"
                          )}
                        </p>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Card>
        )}
      </Card>
    </>
  );
};

export default AdminDateCalendar;
