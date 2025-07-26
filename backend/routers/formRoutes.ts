// 9. routers/userRouter.ts (User routes)
import express, { Request, Response } from "express";
import { createRandomForm } from "../controllesr/formBuilderFormController";

export const formRouter = express.Router();

// POST /api/users/register - Register a new user
formRouter.post("/", createRandomForm);
