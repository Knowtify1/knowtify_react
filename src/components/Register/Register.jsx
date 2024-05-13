import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Button, Form, Input, Card, Select, Space, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  auth,
  setDoc,
  doc,
  db,
  fsTimeStamp,
  collection,
  getDocs,
  where,
  query,
} from "../../config/firebase.jsx";
import { HomeOutlined } from "@ant-design/icons";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showReferenceId, setShowReferenceId] = useState(false);

  const addNewDocument = async (userData, id) => {
    const myDoc = doc(db, "users_accounts_records", `${id}`);
    try {
      await setDoc(myDoc, userData);
      console.log("firestore success");
    } catch (error) {
      console.log(error);
    }
  };

  const createAdminCollection = async (
    userId,
    name,
    email,
    password,
    role,
    dateofregistration
  ) => {
    const adminCollection = doc(db, "admin_accounts", `${userId}`);
    try {
      const adminData = {
        name: name,
        uid: userId,
        email: email,
        password: password,
        type: role,
        dateofregistration: dateofregistration,
      };

      await setDoc(adminCollection, adminData);
      console.log("Doctor collection created successfully");
    } catch (error) {
      console.error("Error creating doctor collection:", error);
    }
  };

  const createDoctorCollection = async (
    userId,
    name,
    email,
    password,
    role,
    dateofregistration
  ) => {
    const doctorsCollection = doc(db, "doctors_accounts", `${userId}`);
    try {
      const docData = {
        name: name,
        uid: userId,
        setSpecialty: false,
        specialty: "",
        email: email,
        password: password,
        type: role,
        dateofregistration: dateofregistration,
      };

      await setDoc(doctorsCollection, docData);

      console.log("Doctor collection created successfully");
    } catch (error) {
      console.error("Error creating doctor collection:", error);
    }
  };

  const createPatientCollection = async (
    userId,
    name,
    email,
    password,
    role,
    referenceId,
    phone,
    dateofregistration
  ) => {
    const patientsCollection = doc(db, "patient_accounts", `${userId}`);
    try {
      const docData = {
        name: name,
        uid: userId,
        email: email,
        password: password,
        type: role,
        referenceId: referenceId,
        phone: phone,
        dateofregistration: dateofregistration,
      };

      await setDoc(patientsCollection, docData);

      console.log("Patient collection created successfully");
    } catch (error) {
      console.error("Error creating patient collection:", error);
    }
  };

  const onFinish = async (values) => {
    const { name, email, password, confirmPassword, role, referenceId, phone } =
      values; // Destructure referenceId from values
    if (password !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);

      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const dateofregistration = fsTimeStamp.now();

          const userData = {
            name: name,
            uid: user.uid,
            email: user.email,
            type: role,
            dateofregistration: dateofregistration,
            password: password,
          };

          addNewDocument(userData, user.uid);

          if (role === "doctor") {
            createDoctorCollection(
              user.uid,
              name,
              email,
              password,
              role,
              dateofregistration
            );
          } else if (role === "patient") {
            createPatientCollection(
              user.uid,
              name,
              email,
              password,
              role,
              referenceId,
              phone,
              dateofregistration
            );
          } else if (role === "admin") {
            createAdminCollection(
              user.uid,
              name,
              email,
              password,
              role,
              dateofregistration
            );
          }

          navigate("/login");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          message.error(errorMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleRoleChange = (value) => {
    setShowReferenceId(value === "patient");
  };

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const user = auth.currentUser;
        if (user && user.displayName) {
          const isPatient = await checkExistingPatient(user.displayName);
          if (isPatient) {
            navigate("/patientdashboard");
          }
        }
      } catch (error) {
        console.error("Error auto-logging in:", error);
      }
    };

    autoLogin();
  }, []);

  return (
    <Card
      title={
        <div>
          <Link to="/" className=" top-3 left-80">
            <Button type="link" icon={<HomeOutlined />} />
          </Link>
          Register
        </div>
      }
      bordered={true}
      style={{ width: 500 }}
      className="drop-shadow-md mt-20"
    >
      <div>
        <Form
          name="login"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 450,
          }}
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your Name!",
              },
            ]}
          >
            <Input type="text" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
            ]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    "The two passwords that you entered do not match!"
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please select a role!",
              },
            ]}
          >
            <Select placeholder="Select a role" onChange={handleRoleChange}>
              <Select.Option value="doctor">Doctor</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              {/* <Select.Option value="patient">Patient</Select.Option> */}
            </Select>
          </Form.Item>

          {showReferenceId && (
            <Form.Item
              label="Reference ID"
              name="referenceId"
              rules={[
                {
                  required: true,
                  message: "Please input your reference ID!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          )}

          <Form.Item
            wrapperCol={{
              offset: 0,
              span: "full",
            }}
            style={{
              marginBottom: 5,
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              className="bg-green-600 w-full"
              loading={loading}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        <h3 className="w-full text-center">
          Already have an accout? <Space />
          <Link to="/login">Login</Link>
        </h3>
      </div>
    </Card>
  );
}

export default Register;
