import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../../../config/firebase.jsx";
import { Spin, Space, Button, Card, Table, Input, notification } from "antd";
import moment from "moment";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

function DoctorPatients() {
  const [userDetails, setUserDetails] = useState(null);
  const [doctorsMoreDetails, setDoctorsMoreDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users_accounts_records", userId);
          const docRef = doc(db, "doctors_accounts", userId);

          try {
            const docSnapshot = await getDoc(userRef);
            const doctorSnapshot = await getDoc(docRef);

            if (docSnapshot.exists() && doctorSnapshot.exists()) {
              const userData = docSnapshot.data();
              const specialty = doctorSnapshot.data();

              const dateOfRegistrationString = userData.dateofregistration
                .toDate()
                .toString();

              setUserDetails({
                ...userData,
                dateofregistration: dateOfRegistrationString,
              });

              setDoctorsMoreDetails(specialty);

              const patientsQuery = query(
                collection(db, "patients"),
                where("assignedDoctorID", "==", specialty.uid)
              );

              const patientsSnapshot = await getDocs(patientsQuery);
              const patientsData = patientsSnapshot.docs.map((doc) => ({
                patientID: doc.id,
                ...doc.data(),
              }));
              setPatients(patientsData);
              setFilteredPatients(patientsData);
            } else {
              console.log("No such document!");
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

    fetchUserDetails();
  }, []);

  const loadAllPatients = () => {
    try {
      setFilteredPatients(patients);
    } catch (error) {
      console.error("Error loading all patients:", error);
      notification.error({
        message: "Error",
        description: "Failed to load all patients. Please try again.",
      });
    }
  };

  const loadTodayPatients = () => {
    try {
      const today = new Date();
      const todayString = moment(today).format("YYYY-MM-DD");

      const todayPatients = patients.filter(
        (patient) =>
          moment(patient.appointmentDate.toDate()).format("YYYY-MM-DD") ===
          todayString
      );

      if (todayPatients.length === 0) {
        notification.error({
          message: "No Patients Today",
          description: "There are no patients scheduled for today.",
        });
      } else {
        setFilteredPatients(todayPatients);
      }
    } catch (error) {
      console.error("Error filtering today's patients:", error);
      notification.error({
        message: "Error",
        description: "Failed to filter today's patients. Please try again.",
      });
    }
  };

  useEffect(() => {
    loadAllPatients();
  }, [doctorsMoreDetails]);

  const columns = [
    {
      title: "Reference ID",
      dataIndex: "reference",
      key: "reference",
    },
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    {
      title: "Appointment Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (text, record) =>
        moment(record.appointmentDate.toDate()).format("MMMM D, YYYY"),
    },
    {
      title: "Appointment Time",
      dataIndex: "appointmentTime",
      render: (text, record) => {
        const appointmentTime = moment(text, "h:mm A");
        const timeLabel = appointmentTime.isBetween(
          moment("6:00 AM", "h:mm A"),
          moment("11:59 AM", "h:mm A")
        )
          ? "AM"
          : "PM";
        return (
          <span>
            {appointmentTime.format("h:mm")} {timeLabel}
          </span>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reasonForAppointment",
      key: "reasonForAppointment",
    },
    { title: "Age", dataIndex: "age", key: "age" },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button type="link" onClick={() => onEditClick(record)}>
          EMR
        </Button>
      ),
    },
  ];

  const onEditClick = (record) => {
    console.log(record);
    const url = "../doctoremr";
    navigate(url, { state: { patientEMRData: record } });
  };

  const onClickAll = () => {
    loadAllPatients();
  };

  const onClickToday = () => {
    loadTodayPatients();
  };

  const compareAppointments = (a, b) => {
    const dateComparison = a.appointmentDate - b.appointmentDate;

    if (dateComparison === 0) {
      // If the dates are equal, compare by appointmentTime
      const timeA = moment(a.appointmentTime, "HH:mm");
      const timeB = moment(b.appointmentTime, "HH:mm");
      return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
    }

    return dateComparison;
  };

  const sortPatientsByDateTime = (patientsArray) => {
    return patientsArray.sort(compareAppointments);
  };

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <div>
          <Card className="overflow-auto max-h-screen p-0">
            <h2>Patients</h2>
            <Space direction="horizontal" size={10} className="mb-2">
              <Search
                placeholder="Search"
                enterButton={<SearchOutlined />}
                onSearch={(value) => {
                  const filteredData = patients.filter((patient) =>
                    Object.values(patient)
                      .join(" ")
                      .toLowerCase()
                      .includes(value.toLowerCase())
                  );
                  setFilteredPatients(sortPatientsByDateTime(filteredData));
                }}
                className="w-60"
              />
              <Button onClick={onClickAll}>All</Button>
              <Button onClick={onClickToday}>Today</Button>
            </Space>

            <Table
              dataSource={sortPatientsByDateTime(filteredPatients)}
              columns={columns}
              rowKey="patientID"
            />
          </Card>
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;
