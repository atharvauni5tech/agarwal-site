const jwt = require("jsonwebtoken");

const mockOtps = [];
const mockBrokers = [];
const mockTokens = [];

const findOtp = (target, type) => {
  const queryField = type === "EMAIL" ? "email" : "mobile_number";
  return mockOtps.find(
    (item) => item[queryField] === target && item.type === type && item.status === 0
  );
};

exports.requestOtp = async (req, res) => {
  try {
    const { email, mobile_number } = req.body;
    if (!email && !mobile_number) {
      return res.status(400).json({
        success: false,
        message: "Either email or mobile number must be provided"
      });
    }

    const type = email ? "EMAIL" : "MOBILE";
    const target = email || mobile_number;
    const generatedOtp = "123456";

    mockOtps.forEach((item) => {
      if ((email && item.email === email) || (mobile_number && item.mobile_number === mobile_number)) {
        item.status = -1;
      }
    });

    mockOtps.push({
      id: mockOtps.length + 1,
      email: email || null,
      mobile_number: mobile_number || null,
      type,
      otp: generatedOtp,
      status: 0,
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${target} (Use OTP: ${generatedOtp})`
    });
  } catch (error) {
    console.error("Error in requestOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, mobile_number, otp } = req.body;
    if (!email && !mobile_number) {
      return res.status(400).json({
        success: false,
        message: "Either email or mobile number must be provided"
      });
    }

    const type = email ? "EMAIL" : "MOBILE";
    const target = email || mobile_number;
    const record = findOtp(target, type);

    if (!record || record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    record.status = 1;
    record.verified_at = new Date();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now proceed to register."
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.registerBroker = async (req, res) => {
  try {
    const {
      broker_name,
      email,
      mobile_number,
      pan_number,
      city,
      state,
      pincode
    } = req.body;

    const existing = mockBrokers.find(b => b.email === email || b.mobile_number === mobile_number);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Broker already registered with this email or mobile number"
      });
    }

    const timeLimit = new Date();
    timeLimit.setMinutes(timeLimit.getMinutes() - 15);

    const isVerified = mockOtps.some(
      (item) =>
        (item.email === email || item.mobile_number === mobile_number) &&
        item.status === 1 &&
        item.verified_at >= timeLimit
    );

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Mobile/Email verification is missing or expired. Please verify OTP first."
      });
    }

    const newBroker = {
      id: mockBrokers.length + 1,
      broker_name,
      email,
      mobile_number,
      pan_number,
      city,
      state,
      pincode,
      role: "BROKER",
      status: 1,
      created_at: new Date()
    };

    mockBrokers.push(newBroker);

    return res.status(201).json({
      success: true,
      message: "Broker registered successfully!",
      data: newBroker
    });
  } catch (error) {
    console.error("Error in registerBroker:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.loginRequestOtp = async (req, res) => {
  try {
    const { email, mobile_number } = req.body;
    if (!email && !mobile_number) {
      return res.status(400).json({
        success: false,
        message: "Either email or mobile number must be provided"
      });
    }

    const target = email || mobile_number;
    const broker = mockBrokers.find(b => b.email === email || b.mobile_number === mobile_number);
    
    if (!broker && mockBrokers.length === 0) {
      mockBrokers.push({
        id: 1,
        broker_name: "Demo Broker",
        email: email || "demo@example.com",
        mobile_number: mobile_number || "9876543210",
        role: "BROKER",
        status: 1
      });
    } else if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker account not found. Please register first."
      });
    }

    return exports.requestOtp(req, res);
  } catch (error) {
    console.error("Error in loginRequestOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.loginVerifyOtp = async (req, res) => {
  try {
    const { email, mobile_number, otp } = req.body;
    
    const type = email ? "EMAIL" : "MOBILE";
    const target = email || mobile_number;
    const record = findOtp(target, type);

    if (!record || record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    record.status = 1;
    record.verified_at = new Date();

    const broker = mockBrokers.find(b => b.email === email || b.mobile_number === mobile_number);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Broker record not found"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "super_secret_jwt_key_12345";
    const token = jwt.sign(
      {
        id: broker.id,
        email: broker.email,
        mobile_number: broker.mobile_number,
        role: broker.role
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    mockTokens.push({
      broker_id: broker.id,
      token,
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      data: {
        id: broker.id,
        broker_name: broker.broker_name,
        role: broker.role
      }
    });
  } catch (error) {
    console.error("Error in loginVerifyOtp:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    const index = mockTokens.findIndex(t => t.token === token);
    if (index !== -1) {
      mockTokens.splice(index, 1);
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getBrokerProfile = async (req, res) => {
  try {
    const broker = mockBrokers.find(b => b.id === req.user.id);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: broker
    });
  } catch (error) {
    console.error("Error in getBrokerProfile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
