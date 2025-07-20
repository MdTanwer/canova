import { Request, Response, NextFunction } from "express";
import { hashPassword } from "../utils/auth";
import { createError } from "../middlewares/errorHandler";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otpGenerator";
import { sendOTPEmail } from "../utils/emailService";
import {
  generateOTPToken,
  generateSecureToken,
  verifyOTPToken,
} from "../utils/tokenGenerator";
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return next(createError("User with this email  already exists", 409));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const newUser = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    };

    // Save user (in production, save to database)
    await User.create(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    next(createError("Registration failed", 500));
  }
};
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Login function
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, send an error
    if (!user) {
      return next(createError("User not found", 404));
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, send an error
    if (!isMatch) {
      return next(createError("Invalid credentials", 401));
    }

    // Exclude the password field before sending the user data
    const { password: _, ...userWithoutPassword } = user.toObject();

    const token = jwt.sign({ user: userWithoutPassword }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token as a cookie (HttpOnly for security)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Only set secure cookies in production
      maxAge: 3600 * 1000, // Token expiration (1 hour)
    });

    // Send the user object without the password and a success message
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(createError("Login failed", 500));
  }
};
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
      return;
    }

    // Generate OTP and secure token
    const otp = generateOTP();
    const otpToken = generateSecureToken();
    const otpTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP and token
    user.otp = Number(otp);
    user.otpToken = otpToken;
    user.otpExpires = otpTokenExpires;
    await user.save();

    // Generate JWT token for cookie
    const jwtToken = generateOTPToken(email);

    // Set cookie with JWT token
    res.cookie("otp_verification_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      jwtToken,
      user,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;

    const cookieToken = req.cookies.otp_verification_token as string;

    if (!otp) {
      res.status(400).json({
        success: false,
        message: "OTP is required",
      });
      return;
    }

    if (!cookieToken) {
      res.status(400).json({
        success: false,
        message: "No verification session found. Please request a new OTP",
      });
      return;
    }

    // Verify JWT token from cookie
    let tokenPayload;
    try {
      tokenPayload = verifyOTPToken(cookieToken);
    } catch (error) {
      res.clearCookie("otp_verification_token");
      res.status(400).json({
        success: false,
        message: "Verification session expired. Please request a new OTP",
      });
      return;
    }

    const { email } = tokenPayload;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.clearCookie("otp_verification_token");
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if OTP token exists and hasn't expired
    if (!user.otpToken || !user.otpExpires) {
      res.clearCookie("otp_verification_token");
      res.status(400).json({
        success: false,
        message: "No active OTP session. Please request a new OTP",
      });
      return;
    }

    if (user.otpExpires < new Date()) {
      res.clearCookie("otp_verification_token");
      res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
      return;
    }

    console.log("user.otp", user.otp, otp);
    // Verify OTP
    if (user.otp !== Number(otp)) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
      return;
    }

    // Mark user as verified and clear OTP data
    user.isVerified = true;
    user.otp = 0;
    user.otpToken = "";
    user.otpExpires = new Date();
    await user.save();

    // Update cookie to indicate verification success (for password setting)
    const verifiedToken = generateOTPToken(`${email}_verified`);
    res.cookie("password_setup_token", verifiedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes to set password
    });

    // Clear OTP verification cookie
    res.clearCookie("otp_verification_token");

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now set your password",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};
