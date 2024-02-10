// infobipService.js
import axios from "axios";

const API_KEY =
  "872bc3f72f0eaf757e3f84a6cfb29244-78a03de8-d9f8-4ea4-a917-b9903aaabbff";

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
