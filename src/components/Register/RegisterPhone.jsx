import React, { useState, useEffect } from "react";
import { Button, Form, Input, Card } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { handleSendCode, handleVerifyCode } from "../../config/signinphone.jsx";
import { HomeOutlined } from "@ant-design/icons";

function RegisterPhone() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false); // State to manage button loading state

  useEffect(() => {
    if (phoneNumber.length === 10 && !codeSent) {
      // Send verification code when phone number is 10 digits and code is not sent
      const formattedPhoneNumber = "+63" + phoneNumber;
      setButtonLoading(true); // Start loading
      handleSendCode(
        formattedPhoneNumber,
        setConfirmationResult,
        setCodeSent
      ).finally(() => setButtonLoading(false)); // Stop loading
    }
  }, [phoneNumber, codeSent]); // Trigger effect when phoneNumber or codeSent changes

  const onVerifyCode = () => {
    handleVerifyCode(confirmationResult, verificationCode).then(() => {
      if (confirmationResult) {
        navigate("/patientdashboard", { replace: true });
        console.log("Verify Success");
      } else {
        console.log("Failed");
      }
    });
  };

  return (
    <Card
      title={
        <div>
          <Link to="/" className="top-3 left-80">
            <Button type="link" icon={<HomeOutlined />} />
          </Link>
          Sign In Phone
        </div>
      }
      bordered={true}
      style={{ width: 350 }}
      className="drop-shadow-md mt-20"
    >
      <div>
        <div>
          <Form>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: "Please input your phone number!" },
                { len: 10, message: "Phone number must be 10 digits!" },
              ]}
            >
              <Input
                addonBefore="+63"
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/, "").slice(0, 10))
                }
              />
            </Form.Item>
            {!codeSent && (
              <div id="recaptcha-container" style={{ display: "none" }}>
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
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                className="bg-green-600 w-full"
                style={{ marginBottom: "10px" }}
                onClick={onVerifyCode}
                disabled={!verificationCode}
              >
                Verify Code
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div id="recaptcha-container" style={{ display: "none" }}></div>
      </div>
    </Card>
  );
}

export default RegisterPhone;
