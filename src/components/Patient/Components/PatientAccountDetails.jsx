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
import { message, Input, Form, Button } from "antd";
import {
  handleSendCode,
  handleVerifyCode,
} from "../../../config/signinphone.jsx";
import { useNavigate } from "react-router-dom";
import { getAuth, PhoneAuthProvider, updatePhoneNumber } from "firebase/auth";

function PatientAccountDetails() {
  const [userDetails, setUserDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedDetails, setUpdatedDetails] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleCancel = () => {
    setEditing(false);
    setUpdatedDetails(userDetails);
    setPhoneNumber(""); // Clear input fields
    setVerificationCode("");
    setCodeSent(false);
  };

  const savePhoneNumberDetails = async () => {
    try {
      const userId = userDetails.uid; // Reusing the old phone number's UID
      const newPhoneNumber = `+63${phoneNumber}`;

      // Update user's phone number and name in user's account
      await updateDoc(doc(db, "users_accounts_records", userId), {
        phone: newPhoneNumber,
        name: updatedDetails.name, // Update name
      });

      // Update patient_accounts collection
      await updateDoc(doc(db, "patient_accounts", userId), {
        phone: newPhoneNumber,
        name: updatedDetails.name, // Update name
      });

      // Update patient's document in patients collection
      const patientQuerySnapshot = await getDocs(
        query(
          collection(db, "patients"),
          where("patientName", "==", userDetails.name)
        )
      );

      for (const doc of patientQuerySnapshot.docs) {
        await updateDoc(doc.ref, {
          contactNo: newPhoneNumber,
          patientName: updatedDetails.name, // Update patient name
        });
      }

      // Update appointments collection
      const appointmentsQuerySnapshot = await getDocs(
        query(
          collection(db, "appointments"),
          where("patientName", "==", userDetails.name)
        )
      );

      for (const doc of appointmentsQuerySnapshot.docs) {
        await updateDoc(doc.ref, {
          contactNo: newPhoneNumber,
          patientName: updatedDetails.name, // Update patient name
        });
      }

      // Update patientRecords collection
      const patientRecordsQuerySnapshot = await getDocs(
        query(
          collection(db, "patientRecords"),
          where("patientName", "==", userDetails.name)
        )
      );

      for (const doc of patientRecordsQuerySnapshot.docs) {
        await updateDoc(doc.ref, {
          contactNo: newPhoneNumber,
          patientName: updatedDetails.name, // Update patient name
        });
      }

      // Display success message
      message.success("Changes saved successfully.");

      // Update local state
      setUserDetails({
        ...userDetails,
        phone: newPhoneNumber,
        name: updatedDetails.name, // Update name in local state
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedDetails({ ...updatedDetails, [name]: value });
  };

  const onSendCode = () => {
    const formattedPhoneNumber = "+63" + phoneNumber;
    setButtonLoading(true);
    handleSendCode(
      formattedPhoneNumber,
      setConfirmationResult,
      setCodeSent
    ).finally(() => setButtonLoading(false));
  };

  const onVerifyCode = async () => {
    if (confirmationResult) {
      try {
        const auth = getAuth();
        const credential = PhoneAuthProvider.credential(
          confirmationResult.verificationId,
          verificationCode
        );

        // Update phone number without logging out
        await updatePhoneNumber(auth.currentUser, credential);

        // Save the phone number details in other collections
        await savePhoneNumberDetails();

        console.log("Verify Success");
      } catch (error) {
        console.error("Error updating document:", error);
      }
    } else {
      console.log("Failed");
    }
  };

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
              <Input
                style={{ marginBottom: "10px" }}
                placeholder="Name"
                name="name"
                value={updatedDetails.name}
                onChange={handleChange}
              />
              <div>
                <Form>
                  <Form.Item
                    label="Phone Number"
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        message: "Please input your phone number!",
                      },
                      { len: 10, message: "Phone number must be 10 digits!" },
                    ]}
                  >
                    <Input
                      addonBefore="+63"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(
                          e.target.value.replace(/\D/, "").slice(0, 10)
                        )
                      }
                    />
                  </Form.Item>
                  {!codeSent && (
                    <div id="recaptcha-container">
                      {/* Your reCAPTCHA component */}
                    </div>
                  )}

                  <Form.Item
                    label="Verification Code"
                    name="verificationCode"
                    rules={[
                      {
                        required: true,
                        message: "Please input the verification code!",
                      },
                    ]}
                  >
                    <Input
                      disabled={!codeSent}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      className="bg-green-600 w-full"
                      style={{ marginBottom: "10px" }}
                      onClick={onSendCode}
                      disabled={!phoneNumber || codeSent}
                    >
                      {buttonLoading ? "Sending..." : "Send Code"}
                    </Button>
                    {!codeSent && (
                      <div id="recaptcha-container">
                        {/* Render reCAPTCHA component only if code has not been sent */}
                        {/* Your reCAPTCHA component */}
                      </div>
                    )}
                    <Button
                      type="primary"
                      className="bg-green-600 w-full"
                      style={{ marginBottom: "10px" }}
                      onClick={onVerifyCode}
                      disabled={!verificationCode}
                    >
                      Verify Code
                    </Button>
                    <Button
                      type="default"
                      className="bg-gray-400 w-full"
                      style={{ marginBottom: "10px" }}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      className="bg-blue-600 w-full"
                      style={{ marginBottom: "10px" }}
                      onClick={savePhoneNumberDetails}
                    >
                      Save
                    </Button>
                  </Form.Item>
                </Form>
              </div>
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
