import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";

function PatientAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "patient_accounts", userId);

          try {
            const docSnapshot = await getDoc(userRef);

            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();

              // Convert Timestamp to a string (or to a format of your choice)
              const dateOfRegistrationString = userData.dateofregistration
                .toDate()
                .toString();
              setUserDetails({
                ...userData,
                dateofregistration: dateOfRegistrationString,
              });

              // Fetch appointments data
              const appointmentsQuery = query(
                collection(db, "appointments"),
                where("userId", "==", userId)
              );

              const appointmentsSnapshot = await getDocs(appointmentsQuery);
              const appointmentsData = appointmentsSnapshot.docs.map(
                (appointment) => ({
                  id: appointment.id,
                  ...appointment.data(),
                })
              );

              setAppointments(appointmentsData);
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching document:", error);
          }
        }
      });

      return () => unsubscribe();
    };

    fetchUserDetails();
  }, []);

  return (
    <div>
      {userDetails ? (
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {userDetails.name}
          </h1>
          <br></br>
          <p>Email: {userDetails.email}</p>
          <p>Date of Registration: {userDetails.dateofregistration}</p>
          <p>User Type: {userDetails.type}</p>

          {appointments.length > 0 && (
            <div>
              <h2>Appointments:</h2>
              <ul>
                {appointments.map((appointment) => (
                  <li key={appointment.id}>
                    Appointment ID: {appointment.id}
                    <br />
                    {/* Display other appointment details as needed */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PatientAccountDetails;
