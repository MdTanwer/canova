import crypto from "crypto";
import jwt from "jsonwebtoken";

export const verifyOTPToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_OTP_SECRET || "your-otp-secret");
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateOTPToken = (email: string): string => {
  return jwt.sign(
    {
      email,
      purpose: "otp_verification",
      timestamp: Date.now(),
    },
    process.env.JWT_OTP_SECRET || "your-otp-secret",
    { expiresIn: "10m" }
  );
};
