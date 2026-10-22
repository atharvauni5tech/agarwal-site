const axios = require('axios');

exports.sendOtpSMS = async (req) => {
  try {
    const message = `https://sms6.rmlconnect.net:8443/bulksms/bulksms?username=Terado&password=Kn76!Rv%24&type=0&dlr=1&destination=${req.to}&source=TERENG&message=Use%20${req.otp}%20to%20authenticate%20your%20phone%20number%20-%20Terado%20Engineering%20Pvt%20Ltd.%20Don%27t%20share%20it.&url=KKKK>&entityid=1201160729812074273&tempid=1207178058901838550`;
    console.log("SMS Message URL: ", message);
    const response = await axios.post(message);
    console.log("SMS API Response:", response.data);

    return {
      success: true,
      message: "OTP sent successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);

    return {
      success: false,
      message: "Failed to send OTP",
      error: error?.response?.data || error.message,
    };
  }
};

exports.sendTemplateSMS = async (phoneNumber, messageText) => {
  try {
    const encodedMessage = encodeURIComponent(messageText);
    const message = `https://sms6.rmlconnect.net:8443/bulksms/bulksms?username=Terado&password=Kn76!Rv%24&type=0&dlr=1&destination=${phoneNumber}&source=TERENG&message=${encodedMessage}`;
    
    console.log("SMS Message URL: ", message);
    const response = await axios.post(message);
    console.log("SMS API Response:", response.data);

    return { success: true, message: "SMS sent successfully", data: response.data };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, message: "Failed to send SMS", error: error?.response?.data || error.message };
  }
};
