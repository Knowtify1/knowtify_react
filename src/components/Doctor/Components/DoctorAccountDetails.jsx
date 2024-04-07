import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase.jsx";
import { EditOutlined } from "@ant-design/icons";
import { message, Select, Typography, Spin, Button, Input } from "antd";
const { Option } = Select;

function DoctorAccountDetails() {
  const { Title, Text } = Typography;
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialtyOptions] = useState([
    { value: "Internal Medicine", label: "Internal Medicine" },
    { value: "Hematology", label: "Internal Medicine (Adult Hematology)" },
    { value: "Infectious", label: "Internal Medicine (Infectious Diseases)" },
    { value: "Pulmonology", label: "Internal Medicine (Pulmonology)" },
    { value: "Ob", label: "Obstetrics and Gynecology" },
    { value: "Orthopedics", label: "General Orthopaedic Surgery" },
    { value: "Physical", label: "Physical Medicine and Rehabilitation" },
    { value: "Pediatrics", label: "Pediatrics, Vaccines, and Immunizations" },
  ]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "doctors_accounts", userId);

          try {
            const docSnapshot = await getDoc(userRef);

            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setUserDetails(userData);
              setUpdatedDetails(userData);
              setLoading(false); // Set loading to false once data is fetched
            } else {
              setError("No such document!"); // Set error if document doesn't exist
              setLoading(false);
            }
          } catch (error) {
            setError("Error fetching document: " + error.message); // Set error if fetch fails
            setLoading(false);
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
      const userRef = doc(db, "doctors_accounts", userId);
      await updateDoc(userRef, updatedDetails);
      setUserDetails(updatedDetails);

      setEditing(false);
      message.success("Changes saved successfully.");
    } catch (error) {
      console.error("Error updating document:", error);
      setError("Error updating document: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  const handleSpecialtyChange = (value) => {
    setUpdatedDetails({ ...updatedDetails, specialty: value });
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
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div style={{ padding: "20px" }}>
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
              <Text strong>Email:</Text> {userDetails.email}
              <br />
              <Text strong>Date of Registration:</Text>{" "}
                {formatDate(userDetails.dateofregistration)}
                <br />
              <Text strong>User Type:</Text> {userDetails.type}
              <br />
              <Text strong>Specialty:</Text> {" "}
                {userDetails.specialty || "No specialty specified"}
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
              <div className="flex flex-col md:flex-col items-center mb-4">
                <div>Specialty:</div>
              <Select
                defaultValue={updatedDetails.specialty}
                style={{ width: 350 }}
                onChange={handleSpecialtyChange}
              >
                {specialtyOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              </div>
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
      )}
    </div>
  );
}

export default DoctorAccountDetails;
