import React from "react";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "../../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Button, Checkbox, Form, Input, Space, Card } from "antd";
import { Link, Navigate, useNavigate, Route, Routes } from "react-router-dom";
import Dashboard from "../../AdminDashboard";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //const signIn = async () => {};

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
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
          console.log("login success");

          //navigate("/dashboard");
          navigate("/admindashboard", { replace: true });
          //<Navigate to={"/dashboard"} replace />;
          // ...
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
      className="drop-shadow-md"
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
        <Button className="bg-green-600 w-full" onClick={signInWithGoogle}>
          SignIn with Google
        </Button>
        <h3 className="w-full text-center">
          Already have account? <Space />
          <Link to="/register">Sign Up</Link>
        </h3>
      </div>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
      </Routes>
    </Card>
  );
};

export default Login;
