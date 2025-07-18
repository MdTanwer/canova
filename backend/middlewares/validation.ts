import { Request, Response, NextFunction } from "express";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "../utils/validation";
import { createError } from "./errorHandler";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, email, password } = req.body;

  // Check if all required fields are provided
  if (!username || !email || !password) {
    return next(createError("Username, email, and password are required", 400));
  }

  // Validate email
  if (!validateEmail(email)) {
    return next(createError("Invalid email format", 400));
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return next(createError(usernameValidation.message!, 400));
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return next(createError(passwordValidation.message!, 400));
  }

  next();
};
