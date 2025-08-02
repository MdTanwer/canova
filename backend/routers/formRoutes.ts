// 9. routers/userRouter.ts (User routes)
import express from "express";
import {
  createRandomForm,
  getFormNameById,
  getPagesByFormId,
  getFormByUniqueUrl,
  formPublich,
  verifyEmail,
  updateFormBackgroundColor,
  updateFormDescription,
} from "../controllesr/formBuilderFormController";
import { createNextPage } from "../controllesr/formBuilderProjectController";
import { checkFormAccess } from "../middlewares/authMiddleware";
export const formRouter = express.Router();

// POST /api/users/register - Register a new user
formRouter.post("/", createRandomForm);

formRouter.get("/pages/:formId", getPagesByFormId);
formRouter.post("/add-page/:formId", createNextPage);
formRouter.get("/:formId", getFormNameById);

formRouter.get("/access/:uniqueUrl", checkFormAccess, getFormByUniqueUrl);
formRouter.post("/verify-browser-email/:uniqueUrl", verifyEmail);
formRouter.post("/publish/:formId", formPublich);
formRouter.put("/color/:formId", updateFormBackgroundColor);
formRouter.put("/desc/:formId", updateFormDescription);
