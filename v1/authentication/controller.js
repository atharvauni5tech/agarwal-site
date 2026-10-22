const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, UserOtp, UserRefreshToken } = require("../../models");
const { sendOtpEmail } = require("../services/emailService");

const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";
const OTP_EXPIRY_MINUTES = 5;

const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};

// -------------------------------------------------------------
// POST /v1/auth/send-otp
// -------------------------------------------------------------
exports.sendOtp = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        await UserOtp.update(
            { isVerified: true },
            { where: { email, isVerified: false } }
        );

        await UserOtp.create({
            email,
            otp: generatedOtp,
            expiresAt,
            isVerified: false
        });

        console.log(`[AUTH] Generated OTP for ${email}: ${generatedOtp}`);

        // Send OTP via email using AWS SES
        await sendOtpEmail(email, generatedOtp);

        return res.status(200).json({
            success: true,
            message: "OTP Sent Successfully!"
        });
    } catch (error) {
        console.error("Error in sendOtp:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP"
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const { otp, name } = req.body;

        const otpRecord = await UserOtp.findOne({
            where: {
                email,
                otp,
                isVerified: false,
                expiresAt: { [Op.gt]: new Date() }
            },
            order: [["createdAt", "DESC"]]
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        otpRecord.isVerified = true;
        await otpRecord.save();

        let user = await User.findOne({ where: { email } });
        if (!user) {
            user = await User.create({
                name: name || email.split("@")[0],
                email,
                role: "USER",
                status: 1
            });
        }

        if (user.status !== 1) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact support."
            });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await UserRefreshToken.create({
            userId: user.id,
            token: refreshToken,
            expiresAt: refreshExpiresAt
        });

        return res.status(200).json({
            success: true,
            message: "Authenticated successfully",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify OTP"
        });
    }
};

// -------------------------------------------------------------
// POST /v1/auth/refresh
// -------------------------------------------------------------
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || "default_refresh_secret_fallback"
            );
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        const tokenRecord = await UserRefreshToken.findOne({
            where: {
                token: refreshToken,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!tokenRecord) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid or has been logged out"
            });
        }

        const user = await User.findByPk(decoded.id);
        if (!user || user.status !== 1) {
            return res.status(401).json({
                success: false,
                message: "User account not found or inactive"
            });
        }

        const newAccessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error("Error in refreshToken:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to refresh token"
        });
    }
};

// -------------------------------------------------------------
// POST /v1/auth/logout
// -------------------------------------------------------------
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Delete token row from userRefreshTokens
        if (refreshToken) {
            await UserRefreshToken.destroy({ where: { token: refreshToken } });
        } else if (req.user && req.user.id) {
            await UserRefreshToken.destroy({ where: { userId: req.user.id } });
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to logout"
        });
    }
};
