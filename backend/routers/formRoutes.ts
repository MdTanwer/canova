// 9. routers/userRouter.ts (User routes)
import express, { Request, Response } from "express";
import {
  createRandomForm,
  getFormNameById,
  getPagesByFormId,
} from "../controllesr/formBuilderFormController";
import { createNextPage } from "../controllesr/formBuilderProjectController";
export const formRouter = express.Router();

// POST /api/users/register - Register a new user
formRouter.post("/", createRandomForm);

formRouter.get("/pages/:formId", getPagesByFormId);
formRouter.post("/add-page/:formId", createNextPage);
formRouter.get("/:formId", getFormNameById);
