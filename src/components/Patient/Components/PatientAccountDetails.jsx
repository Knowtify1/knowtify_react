import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";
import { EditOutlined } from "@ant-design/icons";
import { message } from "antd";

function PatientAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users_accounts_records", userId);

          try {
            const docSnapshot = await getDoc(userRef);

            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setUserDetails(userData);
              setUpdatedDetails(userData);
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

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, "users_accounts_records", userId);
      await updateDoc(userRef, updatedDetails);

      // Update patient_accounts collection
      const patientAccountRef = doc(db, "patient_accounts", userId);
      await updateDoc(patientAccountRef, updatedDetails);

      // Update patient's document in patients collection
      const patientQuerySnapshot = await getDocs(
        query(collection(db, "patients"), where("userId", "==", userId))
      );

      patientQuerySnapshot.forEach(async (doc) => {
        const patientRef = doc.ref;
        await updateDoc(patientRef, { contactNo: updatedDetails.phone });
      });

      // Update appointments collection
      const appointmentsQuerySnapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("patientName", "==", userDetails.name)
        )
      );

      appointmentsQuerySnapshot.forEach(async (doc) => {
        const appointmentRef = doc.ref;
        await updateDoc(appointmentRef, { contactNo: updatedDetails.phone });
      });

      // Update patientRecords collection
      const patientRecordsQuerySnapshot = await getDocs(
        query(collection(db, "patientRecords"), where("userId", "==", userId))
      );

      patientRecordsQuerySnapshot.forEach(async (doc) => {
        const patientRecordRef = doc.ref;
        await updateDoc(patientRecordRef, { contactNo: updatedDetails.phone });
      });

      setUserDetails(updatedDetails);
      setEditing(false);
      message.success("Changes saved successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  // Function to format Firestore Timestamp to "Month Day, Year"
  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div>
      {userDetails ? (
        <div>
          {!editing ? (
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
              <EditOutlined
                style={{
                  fontSize: "16px",
                  color: "blue",
                  cursor: "pointer",
                }}
                onClick={handleEdit}
              />
              <br />
              <p>Phone: {userDetails.phone}</p>
              <p>
                Date of Registration:{" "}
                {formatDate(userDetails.dateofregistration)}
              </p>
              <p>User Type: {userDetails.type}</p>
            </div>
          ) : (
            <div>
              <input
                type="text"
                name="name"
                value={updatedDetails.name}
                onChange={handleChange}
              />

              <input
                type="tel"
                name="phone"
                value={updatedDetails.phone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="type"
                value={updatedDetails.type}
                onChange={handleChange}
              />
              <button
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
                onClick={handleSave}
              >
                Save
              </button>
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
