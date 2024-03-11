import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";
import { EditOutlined } from "@ant-design/icons";

function PatientAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);

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
      const userRef = doc(db, "patient_accounts", userId);
      await updateDoc(userRef, updatedDetails);
      setUserDetails(updatedDetails);
      setEditing(false);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  // Function to format Firestore Timestamp to a readable string
  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleString();
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
              <p>Email: {userDetails.email}</p>
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
                type="email"
                name="email"
                value={updatedDetails.email}
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
