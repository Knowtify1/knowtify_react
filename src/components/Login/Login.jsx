import React from "react";
import { useState, useEffect } from "react";
import { auth } from "../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button, Checkbox, Form, Input, Space, Card, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { doc, db, getDoc } from "../../config/firebase";
import { LoadingOutlined } from "@ant-design/icons";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigateAfterLogin(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateAfterLogin = (user) => {
    const myDoc = doc(db, "users", user.uid);

    getDoc(myDoc)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const type = docSnap.data()?.type;

          if (type === "admin") {
            navigate("/admindashboard", { replace: true });
          } else if (type === "doctor") {
            navigate("/doctordashboard", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  };

  const onFinish = async (values) => {
    setShowSpinner(true);

    //signIn();
    try {
      const { email, password } = values;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      setUser(user);
      navigateAfterLogin(user);
    } catch (error) {
      const errorMessage = error.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowSpinner(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className=" flex items-center justify-center">
      {showSpinner && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-70 z-50">
          <Spin indicator={<LoadingOutlined />} size="large" />
        </div>
      )}
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
              <Input type="email" disabled={loading} />
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
              <Input.Password disabled={loading} />
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
                Login
              </Button>
            </Form.Item>
          </Form>

          <h3 className="w-full text-center">
            Don't have account? <Space />
            <Link to="/register">Sign Up</Link>
          </h3>
        </div>
      </Card>
    </div>
  );
};

export default Login;
