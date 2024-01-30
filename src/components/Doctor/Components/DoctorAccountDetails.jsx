import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";
import { Button, Modal } from "antd";

function DoctorAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [doctorsMoreDetails, setdoctorsMoreDetails] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

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

  const handleEditClick = () => {
    setEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  return (
    <div>
      {userDetails ? (
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
            {userDetails.name}
          </h1>
          <br></br>
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
