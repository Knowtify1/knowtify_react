import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";

function AdminAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users", userId);

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
          <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>
            {userDetails.name}
          </h1>
          <br></br>
          <p>Email: {userDetails.email}</p>
          <p>Date of Registration: {userDetails.dateofregistration}</p>
          <p>User Type: {userDetails.type}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default AdminAccountDetails;
