import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Select, Calendar, Badge } from "antd";
import moment from "moment";
import {
  collection,
  getDocs,
  where,
  query,
  db,
} from "../../config/firebase.jsx";

const { Option } = Select;

const getMonthYearKey = (value) => value.month() + "-" + value.year();

const AdminCalendar = () => {
  const location = useLocation();
  const { specialty } = location.state || {};

  const [doctorsData, setDoctorsData] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientsData, setPatientsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };

    fetchData();
  }, [specialty]);

  const handleSelectChange = async (value) => {
    setSelectedDoctor(value);

    try {
      const patientsCollection = collection(db, "patients");
      const patientsQuery = query(
        patientsCollection,
        where(
          "typeOfDoctor",
          "==",
          doctorsData.find((doctor) => doctor.id === value)?.specialty
        ),
        where("status", "==", "assigned")
      );

      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientsData(patientsData);

      console.log("patientData", patientsData);
    } catch (error) {
      console.error("Error fetching patient data from Firebase:", error);
    }
  };

  const cellRender = (value) => {
    const listData = getListData(value);
    const monthYearKey = getMonthYearKey(value);

    return (
      <div>
        <h4>{value.date()}</h4>
        <ul className="events">
          {listData.map((item, index) => (
            <li key={`${monthYearKey}-${index}`}>
              <Badge status={item.type} text={item.content} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const getListData = (value) => {
    //console.log("Datas: ", value);
    const formattedDate = moment(value).format("YYYY-MM-DD");

    const dateEvents = patientsData
      .filter(
        (patient) =>
          moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
          formattedDate
      )
      .map((patient) => ({
        type: "warning", // Customize the badge type based on your needs
        content: `${moment(patient.appointmentDate.toDate()).format("LT")} - ${
          patient.patientName
        }`,
      }));

    return dateEvents;
  };

  return (
    <>
      <div>
        <h2>Calendar</h2>
        <p>Received state: {specialty}</p>

        <Select
          style={{ width: "200px" }}
          placeholder="Select a doctor"
          onChange={handleSelectChange}
        >
          {doctorsData.map((doctor) => (
            <Option key={doctor.id} value={doctor.id}>
              {doctor.name}
            </Option>
          ))}
        </Select>

        {selectedDoctor && (
          <div>
            <h3>Selected Doctor:</h3>
            <p>
              Name: {doctorsData.find((doc) => doc.id === selectedDoctor)?.name}
            </p>
            <p>
              Specialty:{" "}
              {doctorsData.find((doc) => doc.id === selectedDoctor)?.specialty}
            </p>
          </div>
        )}

        <Calendar cellRender={cellRender} />
      </div>
    </>
  );
};

export default AdminCalendar;
