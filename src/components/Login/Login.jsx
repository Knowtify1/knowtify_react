import React from "react";
import { useState } from "react";
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button, Checkbox, Form, Input, Space, Card } from "antd";
import { Link, Navigate, useNavigate, Route, Routes } from "react-router-dom";
import { setDoc, doc, db, getDoc } from "../../config/firebase";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //const signIn = async () => {};
  const onVerify = async (id) => {
    const myDoc = doc(db, "users", `${id}`);
    try {
      const docSnap = await getDoc(myDoc);

      if (docSnap.exists()) {
        const type = docSnap.data()?.type;
        if (type == "admin") {
          navigate("/admindashboard", { replace: true });
        } else if (type == "doctor") {
          navigate("/doctordashboard", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
        //console.log("The type data:", type);
        //console.log("Document data:", docSnap.data());
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
      }
    } catch (e) {
      console.log("Error getting cached document:", e);
    }
  };

  const onFinish = async (values) => {
    const { email, password } = values;
    console.log("aaUsername:", email);
    console.log("aaPass:", password);

    //signIn();
    try {
      await signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up
          const user = userCredential.user;
          console.log("user:", user);
          //console.log("login success");
          onVerify(user.uid);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    } catch (error) {}
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Card
      title="Login"
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
            name="remember"
            valuePropName="checked"
            wrapperCol={{
              offset: 1,
              span: "full",
            }}
          >
            <Checkbox>Remember me</Checkbox>
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
              Submit
            </Button>
          </Form.Item>
        </Form>

        <h3 className="w-full text-center">
          Already have account? <Space />
          <Link to="/register">Sign Up</Link>
        </h3>
      </div>
    </Card>
  );
};

export default Login;
