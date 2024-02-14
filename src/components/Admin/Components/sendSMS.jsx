// infobipService.js
import axios from "axios";

const API_KEY =
  "a70dac1b0dd04cf6497e1f08add4d0c1-a61cc062-b7af-42e9-9aeb-9bc212d58dfb";

const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post(
      "https://api.infobip.com/sms/2/text/single",
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
