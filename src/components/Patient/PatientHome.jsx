import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Card } from "antd";
import {
  auth,
  db,
  collection,
  query,
  where,
  getDocs,
} from "../../config/firebase.jsx";
import PatientOverview from "../Patient/Components/PatientOverview";
import PatientWelcome from "./Components/PatientWelcome";

function PatientHome() {
  const [closestAppointment, setClosestAppointment] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "patient_accounts"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const name = userData.name;
            fetchClosestAppointment(name);
          } else {
            console.error("No user data found in patient collection.");
          }
        } catch (error) {
          console.error("Error fetching user details:", error.message);
        }
      } else {
        setClosestAppointment(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchClosestAppointment = async (name) => {
    try {
      const appointmentsQuerySnapshot = await getDocs(
        query(collection(db, "appointments"), where("patientName", "==", name))
      );

      const patientsQuerySnapshot = await getDocs(
        query(collection(db, "patients"), where("patientName", "==", name))
      );

      const appointmentsData = appointmentsQuerySnapshot.docs.map((doc) =>
        doc.data()
      );

      const patientsData = patientsQuerySnapshot.docs.map((doc) => doc.data());

      const allAppointments = [...appointmentsData, ...patientsData];

      const updatedAppointments = allAppointments.map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate.toDate());
        const today = new Date();
        const diffTime = appointmentDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...appointment, daysRemaining: diffDays };
      });

      const filteredAppointments = updatedAppointments.filter(
        (appointment) => appointment.daysRemaining >= 1
      );

      const sortedAppointments = filteredAppointments.sort(
        (a, b) => a.daysRemaining - b.daysRemaining
      );

      if (sortedAppointments.length > 0) {
        setClosestAppointment(sortedAppointments[0]);
      } else {
        setClosestAppointment(null);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
    }
  };

  const formatAppointmentTime = (time) => {
    if (!time) return "";
    return time.replace(/"/g, "");
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f4f8",
        minHeight: "100vh",
      }}
    >
      <PatientWelcome />
      <div className="flex flex-col items-center">
        <div className="w-full text-center">
          <Card
            className="overflow-auto"
            style={{
              width: "100%",
              height: "auto",
              backgroundColor: "#fff",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3
              className="text-3xl font-semibold pt-0"
              style={{ color: "#333" }}
            >
              Overview
            </h3>
            <PatientOverview />
          </Card>
        </div>
      </div>
      <Card
        className="overflow-auto"
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: "#F7f6ee",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="overflow-auto max-h-screen pt-0">
          <div className="w-full text-center">
            <h3
              className="text-2xl font-semibold pt-0"
              style={{ color: "#333" }}
            >
              Upcoming Appointment
            </h3>
            {closestAppointment && (
              <table
                title="Upcoming Appointment"
                style={{
                  width: "100%",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <tbody>
                  <tr>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Assigned Doctor</th>
                    <th>Days Remaining</th>
                  </tr>
                  <tr>
                    <td>
                      {closestAppointment.appointmentDate
                        ?.toDate()
                        .toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                    </td>
                    <td>
                      {closestAppointment.appointmentTime &&
                        closestAppointment.appointmentTime.replace(
                          /"/g,
                          ""
                        )}{" "}
                      {/AM|PM/.test(closestAppointment.appointmentTime)
                        ? ""
                        : closestAppointment.appointmentTime.includes("AM")
                        ? "AM"
                        : "PM"}
                    </td>

                    <td>{closestAppointment.assignedDoctor}</td>
                    <td>{closestAppointment.daysRemaining}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PatientHome;
