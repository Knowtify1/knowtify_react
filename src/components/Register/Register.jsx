import React from "react";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { Button, Checkbox, Form, Input, Space, Card, Select } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";

import { setDoc, doc, db } from "../../config/firebase";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usersID, setUsersID] = useState();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  // Add a new document to the collection
  const addNewDocument = async (userData, id) => {
    const usersCollectionPath = `users/${id}`;
    console.log("id", id);
    // const usersCollection = getFirestoreCollection(`users`, `account`);
    // try {
    //   await addDocument(usersCollection, userData);
    //   console.log("firestore success");
    // } catch (error) {
    //   console.log(error);
    // }
    const myDoc = doc(db, "users", `${id}`);
    const docSnap = await getDoc(ref);
    try {
      await setDoc(myDoc, userData);
      console.log("firestore success");
    } catch (error) {
      console.log(error);
    }
  };

  const onFinish = async (values) => {
    const { name, email, password, role } = values;
    //console.log("aaname:", name);
    //console.log("aaUsername:", email);
    //console.log("aaPass:", password);

    //signIn();
    try {
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          console.log("user:", user);

          console.log("create auth success");

          //set documents data
          const userData = {
            name: name,
            uid: user.uid,
            email: user.email,
            type: role,
            dateofregistration: Timestamp.now(),
            password: password,
          };

          //call function to add firestore
          addNewDocument(userData, user.uid);

          navigate("/login");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Card
      title="Register"
      bordered={true}
      style={{ width: 350 }}
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
            maxWidth: 300,
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
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please select a role!",
              },
            ]}
          >
            <Select placeholder="Select a role">
              <Select.Option value="doctor">Doctor</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

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
        <Button className="bg-green-600 w-full" onClick={signInWithGoogle}>
          SignIn with Google
        </Button>
      </div>
    </Card>
  );
}

export default Register;
