// 9. routers/userRouter.ts (User routes)
import express, { Request, Response } from "express";
import {
  createProjectWithForm,
  getAllProjectsSummary,
  deleteById,
} from "../controllesr/formBuilderProjectController";

export const projectRouter = express.Router();

// POST /api/users/register - Register a new user
projectRouter.post("/", createProjectWithForm);
// GET /api/projects/summary - Get all projects summary
projectRouter.get("/summary", getAllProjectsSummary);
// DELETE /api/projects/:id - Delete project or form by id
projectRouter.delete("/:id", deleteById);
