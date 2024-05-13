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

  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //       if (user) {
  //         const userId = user.uid;
  //         const userRef = doc(db, "users_accounts_records", userId);
  //         const docRef = doc(db, "doctors_accounts", userId);

  //         try {
  //           const docSnapshot = await getDoc(userRef);
  //           const doctorSnapshot = await getDoc(docRef);

  //           if (docSnapshot.exists() && doctorSnapshot.exists()) {
  //             const userData = docSnapshot.data();
  //             const specialty = doctorSnapshot.data();

  //             const dateOfRegistrationString = userData.dateofregistration
  //               .toDate()
  //               .toString();

  //             setUserDetails({
  //               ...userData,
  //               dateofregistration: dateOfRegistrationString,
  //             });

  //             setDoctorsMoreDetails(specialty);

  //             const patientsQuery = query(
  //               collection(db, "patients"),
  //               where("assignedDoctorID", "==", specialty.uid)
  //             );

  //             const patientsSnapshot = await getDocs(patientsQuery);
  //             const patientsData = patientsSnapshot.docs.map((doc) => ({
  //               patientID: doc.id,
  //               ...doc.data(),
  //             }));
  //             setPatients(patientsData);
  //             setFilteredPatients(patientsData);
  //           } else {
  //             console.log("No such document!");
  //           }
  //         } catch (error) {
  //           console.error("Error fetching document:", error);
  //         } finally {
  //           setLoading(false);
  //         }
  //       }
  //     });

  //     return () => unsubscribe();
  //   };

  //   fetchUserDetails();
  // }, []); // Empty dependency array as this effect should only run once

  // const columns = [
  //   {
  //     title: "Patient Name",
  //     dataIndex: "patientName",
  //     key: "patientName",
  //   },
  //   {
  //     title: "Appointment Date",
  //     dataIndex: "appointmentDate",
  //     key: "appointmentDate",
  //     render: (text, record) =>
  //       moment(record.appointmentDate.toDate()).format("MMMM D, YYYY"),
  //   },
  //   {
  //     title: "Time",
  //     dataIndex: "appointmentTime",
  //     key: "appointmentTime",
  //     render: (text, record) =>
  //       moment(record.appointmentTime, "HH:mm").format("HH:mm"),
  //   },
  //   {
  //     title: "Reason",
  //     dataIndex: "reasonForAppointment",
  //     key: "reasonForAppointment",
  //   },
  //   {
  //     title: "Action",
  //     key: "view",
  //     render: (text, record) => (
  //       <Link to="/doctordashboard/doctorappointment">View </Link>
  //     ),
  //   },
  // ];

  return (
    <>
      <div className="w-full text-center">
        <DoctorSetSpecialty />
        <Card
          className="overflow-auto pl-5" // Set a maximum height and padding
          style={{
            width: "100%",
            height: "auto",
            backgroundColor: "#fff",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 className="text-3xl font-semibold pt-0" style={{ color: "#333" }}>
            Doctor Overview
          </h3>{" "}
          <DoctorOverview />
        </Card>
        {/* <Card
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
        </Card>  */}
      </div>
    </>
  );
}

export default DoctorHome;
