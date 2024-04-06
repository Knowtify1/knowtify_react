import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  reauthenticateWithPhoneNumber,
} from "firebase/auth";
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
import { Button, Input, Typography, Spin, message } from "antd";
import {
  handleSendCode,
  handleVerifyCode,
} from "../../../config/signinphone.jsx";

function PatientAccountDetails() {
  const { Title, Text } = Typography;
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [codeSent, setCodeSent] = useState(false);

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
      if (codeSent && confirmationResult) {
        await confirmationResult.confirm(verificationCode);
      } else {
        message.error("Please verify your phone number before saving.");
        return;
      }

      // Reauthenticate to update phone number
      const user = auth.currentUser;
      const credential = signInWithPhoneNumber(
        auth,
        phoneNumber,
        RecaptchaVerifier
      );
      await reauthenticateWithPhoneNumber(user, credential);

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
      message.error("Failed to save changes.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  const onSendCode = () => {
    handleSendCode(phoneNumber, setConfirmationResult, setCodeSent);
  };

  const onVerifyCode = () => {
    handleVerifyCode(confirmationResult, verificationCode);
    if (confirmationResult) {
      message.success("Phone number verified successfully.");
    } else {
      message.error("Failed to verify phone number.");
    }
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
    <div style={{ padding: "20px" }}>
      {userDetails ? (
        <div>
          {!editing ? (
            <div style={{ textAlign: "center" }}>
              <Title level={2}>{userDetails.name}</Title>
              <EditOutlined
                style={{ fontSize: "16px", color: "blue", cursor: "pointer" }}
                onClick={handleEdit}
              />
              <br />
              <Text strong>Phone:</Text> {userDetails.phone}
              <br />
              <Text strong>Date of Registration:</Text>{" "}
              {formatDate(userDetails.dateofregistration)}
              <br />
              <Text strong>User Type:</Text> {userDetails.type}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Name"
                name="name"
                value={updatedDetails.name}
                onChange={handleChange}
              />
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Phone"
                name="phone"
                value={updatedDetails.phone}
                onChange={handleChange}
              />
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Type"
                name="type"
                value={updatedDetails.type}
                onChange={handleChange}
              />
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button
                onClick={onSendCode}
                disabled={!updatedDetails.phone || codeSent}
                style={{ marginRight: "10px", marginBottom: "10px" }}
              >
                Send Verification Code
              </Button>
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <Button
                onClick={onVerifyCode}
                disabled={!verificationCode || !codeSent}
                style={{ marginRight: "10px" }}
              >
                Verify Code
              </Button>
              <Button onClick={handleSave} style={{ marginRight: "10px" }}>
                Save
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}
        </div>
      ) : (
        <Spin />
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default PatientAccountDetails;
