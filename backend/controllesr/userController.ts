import { Request, Response, NextFunction } from "express";
import { hashPassword } from "../utils/auth";
import { createError } from "../middlewares/errorHandler";
import User from "../models/User";

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
