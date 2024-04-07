import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";
import { EditOutlined } from "@ant-design/icons";
import { message, Typography, Input, Button } from "antd";

function AdminAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);
  const { Title, Text } = Typography;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "admin_accounts", userId);

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
      const userRef = doc(db, "admin_accounts", userId);
      await updateDoc(userRef, updatedDetails);
      setUserDetails(updatedDetails);

      // Save changes to users_accounts_records
      const userRecordsRef = doc(db, "users_accounts_records", userId);
      await updateDoc(userRecordsRef, updatedDetails);

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

  // Function to format Firestore Timestamp to a readable string
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
              <Title level={2}>{userDetails.name}</Title>
              <EditOutlined
                style={{ fontSize: "16px", color: "blue", cursor: "pointer" }}
                onClick={handleEdit}
              />
              <br />
              <Text>Email:</Text> {userDetails.email}
              <br />
              <Text>Date of Registration:</Text>{" "}
              {formatDate(userDetails.dateofregistration)}
              <br />
              <Text>User Type:</Text> {userDetails.type}
            </div>
          ) : (
            <div>
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Name"
                name="name"
                value={updatedDetails.name}
                onChange={handleChange}
              />
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Email"
                name="email"
                value={updatedDetails.email}
                onChange={handleChange}
              />
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Type"
                name="type"
                value={updatedDetails.type}
                onChange={handleChange}
              />
              <Button
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
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default AdminAccountDetails;
