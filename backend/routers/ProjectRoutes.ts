// 9. routers/userRouter.ts (User routes)
import express, { Request, Response } from "express";
import { createProjectWithForm } from "../controllesr/formBuilderProjectController";

export const projectRouter = express.Router();

// POST /api/users/register - Register a new user
projectRouter.post("/", createProjectWithForm);
