import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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
      await setDoc(userRef, updatedDetails, { merge: true }); // Use setDoc instead of updateDoc

      // Save changes to users_accounts_records
      const userRecordsRef = doc(db, "users_accounts_records", userId);
      await setDoc(userRecordsRef, updatedDetails, { merge: true }); // Use setDoc instead of updateDoc

      setUserDetails(updatedDetails);
      setEditing(false);
      message.success("Changes saved successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
      message.error("Failed to save changes.");
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
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {userDetails.name}
              </h1>{" "}
              <EditOutlined
                style={{
                  fontSize: "16px",
                  color: "#38a169",
                  cursor: "pointer",
                }}
                onClick={handleEdit}
              />
              <br />
              <Text strong>Email:</Text> {userDetails.email}
              <br />
              <Text strong>Date of Registration:</Text>{" "}
              {formatDate(userDetails.dateofregistration)}
              <br />
              <Text strong>User Type:</Text> {userDetails.type}
              <br />
            </div>
          ) : (
            <div className="text-center">
              <div className="flex flex-col md:flex-col items-center mb-4">
                <div>Name:</div>
                <Input
                  className="w-full"
                  placeholder="Enter name"
                  name="name"
                  value={updatedDetails.name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col md:flex-col items-center mb-4">
                <div>Email:</div>
                <Input
                  className="w-full"
                  placeholder="Email"
                  name="email"
                  value={updatedDetails.email}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col md:flex-col items-center mb-4">
                <div>User Type:</div>
                <Input
                  className="w-full"
                  placeholder="Type"
                  name="type"
                  value={updatedDetails.type}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-green-600 "
                onClick={handleSave} // <- Added onClick event for save
              >
                Save
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
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
