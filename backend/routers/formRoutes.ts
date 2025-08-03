// 9. routers/userRouter.ts (User routes)
import express from "express";
import {
  createRandomForm,
  getFormNameById,
  getPagesByFormId,
  getFormByUniqueUrl,
  verifyEmail,
  updateFormBackgroundColor,
  updateFormDescription,
  formPublish,
  getFormShareUrl,
  attemptQuestion,
  updateFormTitle,
  incrementFormViews,
} from "../controllesr/formBuilderFormController";
import { createNextPage } from "../controllesr/formBuilderProjectController";
import { checkFormAccess } from "../middlewares/authMiddleware";
export const formRouter = express.Router();

// POST /api/users/register - Register a new user
formRouter.post("/", createRandomForm);

formRouter.get("/pages/:formId", getPagesByFormId);
formRouter.post("/add-page/:formId", createNextPage);
formRouter.get("/name/:formId", getFormNameById);

formRouter.get("/access/:uniqueUrl", checkFormAccess, getFormByUniqueUrl);
formRouter.post("/verify-browser-email/:uniqueUrl", verifyEmail);
formRouter.post("/publish/:formId", formPublish);
formRouter.put("/color/:formId", updateFormBackgroundColor);
formRouter.put("/desc/:formId", updateFormDescription);
formRouter.get("/shareUrl/:formId", getFormShareUrl);
formRouter.post("/shareUrl/:formId", attemptQuestion);
formRouter.put("/rename/:formId", updateFormTitle);
formRouter.post("/views/:uniqueUrl", incrementFormViews);
