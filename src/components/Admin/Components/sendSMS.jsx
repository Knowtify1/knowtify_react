// infobipService.js
import axios from "axios";

const API_KEY =
  "91fd9aed329b6066cc5c66300d8d348e-b2bd4470-49aa-4a0f-93d6-83575ed31c6d";

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
