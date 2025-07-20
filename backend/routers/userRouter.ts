// 9. routers/userRouter.ts (User routes)
import express, { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  sendOTP,
  setPassword,
  verifyOTP,
} from "../controllesr/userController";
import { validateRegistration } from "../middlewares/validation";

export const userRouter = express.Router();

// POST /api/users/register - Register a new user
userRouter.post("/register", validateRegistration, registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/set-password", setPassword);
