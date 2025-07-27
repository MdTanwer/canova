import express from "express";
import {
  createQuestion,
  uploadReferenceMedia,
} from "../controllesr/formbuilderQuestionController";

export const questionRouter = express.Router();

questionRouter.post("/", uploadReferenceMedia, createQuestion);
