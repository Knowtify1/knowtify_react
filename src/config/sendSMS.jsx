// infobipService.js
import axios from "axios";

const API_KEY =
  "9aa421d61698ade2a1312a47e792dd1d-3aa328a3-54ae-4bbc-bbb9-d380f3feae19";

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post(
      "https://api.infobip.com/sms/1/text/single",
      {
        from: "YOUR_SENDER_ID",
        to: phoneNumber,
        text: message,
      },
      {
        headers: {
          Authorization: `App ${API_KEY}`,
        },
      }
    );
    console.log("Hey SMS sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

export { sendSMS };
