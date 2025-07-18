// 9. routers/userRouter.ts (User routes)
import express from "express";
import { registerUser } from "../controllesr/userController";
import { validateRegistration } from "../middlewares/validation";

export const userRouter = express.Router();

// POST /api/users/register - Register a new user
userRouter.post("/register", validateRegistration, registerUser);
