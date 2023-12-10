import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";

function DoctorAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [doctorsMoreDetails, setdoctorsMoreDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users", userId);
          const docRef = doc(db, "doctors", userId);

          try {
            const docSnapshot = await getDoc(userRef);
            const docsnapshot = await getDoc(docRef);

            if (docSnapshot.exists() && docsnapshot.exists()) {
              const userData = docSnapshot.data();
              const specialty = docsnapshot.data();

              // Convert Timestamp to a string (or to a format of your choice)
              const dateOfRegistrationString = userData.dateofregistration
                .toDate()
                .toString();

              setUserDetails({
                ...userData,
                dateofregistration: dateOfRegistrationString,
              });

              setdoctorsMoreDetails(specialty);
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
          <h2>User Details</h2>
          <p>Name: {userDetails.name}</p>
          <p>Email: {userDetails.email}</p>
          <p>Date of Registration: {userDetails.dateofregistration}</p>
          <p>User Type: {userDetails.type}</p>
          <p>Specialty: {doctorsMoreDetails.specialty}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default DoctorAccountDetails;
