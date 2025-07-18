import { Request, Response, NextFunction } from "express";
import { CreateUserData, UserResponse } from "../models/User";
import { hashPassword, generateToken } from "../utils/auth";
import { createError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

// In-memory storage (replace with database in production)
const users: any[] = [];

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password }: CreateUserData = req.body;

    // Check if user already exists
    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() ||
        user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
      return next(
        createError("User with this email or username already exists", 409)
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user object
    const newUser = {
      id: generateUserId(),
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user (in production, save to database)
    users.push(newUser);

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email);

    // Create response object (exclude password)
    const userResponse: UserResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    next(createError("Registration failed", 500));
  }
};
