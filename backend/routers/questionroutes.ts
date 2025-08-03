import express from "express";
import {
  createQuestion,
  reorderQuestions,
  deleteQuestion,
  updateQuestion,
  getQuestionById,
  getQuestionsByPage,
  uploadReferenceMedia,
  bulkCreateQuestions,
} from "../controllesr/formbuilderQuestionController";
import { fileUpload } from "../controllesr/uploadmedia";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const questionRouter = express.Router();

questionRouter.post("/", uploadReferenceMedia, createQuestion);

// Get questions by page
questionRouter.get("/:pageId", getQuestionsByPage);

// Get single question
questionRouter.get("/:questionId", getQuestionById);

// Update question (with optional reference media upload)
questionRouter.put("/:questionId", uploadReferenceMedia, updateQuestion);

// Delete question
questionRouter.delete("/:questionId", deleteQuestion);

// Reorder questions within a page
questionRouter.put("/page/:pageId/reorder", reorderQuestions);

// Bulk create questions
questionRouter.post("/bulk", bulkCreateQuestions);

questionRouter.post("/media", upload.single("file"), fileUpload);

export default questionRouter;
