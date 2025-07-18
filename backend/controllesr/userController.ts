import { Request, Response, NextFunction } from "express";
import { hashPassword } from "../utils/auth";
import { createError } from "../middlewares/errorHandler";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
