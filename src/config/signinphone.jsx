import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../config/firebase.jsx";
import { message } from "antd";

export const handleSendCode = async (
  phoneNumber,
  setConfirmationResult,
  setCodeSent
) => {
  try {
    console.log("Sending code...");
    const recaptchaContainer = document.getElementById("recaptcha-container");
    const appVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
      size: "invisible",
    });
    const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    setConfirmationResult(result);
    setCodeSent(true);
    console.log(result);
    message.success("Verification code sent successfully!");
  } catch (error) {
    console.error(error);
    message.error("Failed to send verification code");
  }
};

export const handleVerifyCode = async (
  confirmationResult,
  verificationCode,
  setPatientAuthID
) => {
  try {
    console.log("Verifying code...");
    if (confirmationResult) {
      await confirmationResult.confirm(verificationCode);

      const user = auth.currentUser;
      if (user) {
        setPatientAuthID(user.uid);
        console.log("UID after verification:", user.uid);
        // You can use the UID here as needed
      }
      console.log("UID:" + user + " " + user.uid);
      console.log("Successfully authenticated");
      message.success("Successfully authenticated");
    } else {
      message.error(
        "Verification code confirmation failed: Confirmation result is null"
      );
    }
  } catch (error) {
    console.error(error);
    message.error("Failed to verify code");
  }
};
