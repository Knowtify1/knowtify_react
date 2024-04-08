import React, { useState, useEffect } from "react";
import { Card, Table } from "antd";
import DoctorOverview from "../Doctor/Components/DoctorOverView";
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
} from "../../config/firebase.jsx";
import moment from "moment";
import { Link } from "react-router-dom";
import DoctorSetSpecialty from "./Components/DoctorSetSpecialty";

function DoctorHome() {
  const [userDetails, setUserDetails] = useState(null);
  const [doctorsMoreDetails, setDoctorsMoreDetails] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Sort filteredPatients based on appointmentDate
    setFilteredPatients(
      [...filteredPatients].sort(
        (a, b) => a.appointmentDate - b.appointmentDate
      )
    );
  }, [filteredPatients]);

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patientName",
      key: "patientName",
    },
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
    {
      title: "Action",
      key: "view",
      render: (text, record) => (
        <Link to="/doctordashboard/doctorappointment">View </Link>
      ),
    },
  ];

  return (
    <>
      <div className="w-full text-center">
        <div className="w-full text-center">
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Doctor Overview
          </h3>{" "}
        </div>
        <DoctorSetSpecialty />
        <Card
          className="overflow-auto max-h-screen pl-5" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <DoctorOverview />
        </Card>
        <h3 className="text-2xl font-semibold pt-0" style={{ color: "#333" }}>
          Upcoming Appointment
        </h3>{" "}
        <Card
          className="overflow-auto max-h-screen pl-5" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table columns={columns} dataSource={filteredPatients} />
          )}
        </Card>
      </div>
    </>
  );
}

export default DoctorHome;
