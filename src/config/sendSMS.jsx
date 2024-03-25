// infobipService.js
import axios from "axios";

const API_KEY =
  "41c85054fb698fbfe289faa478220560-f290cc12-bb9a-4838-b389-b092e27cea09";

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
