import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Form } from "../models/Index";

export const createRandomForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find the next available form name
    let counter = 1;
    let formName = `form${counter}`;
    let existing = await Form.findOne({ title: formName });
    while (existing) {
      counter++;
      formName = `form${counter}`;
      existing = await Form.findOne({ title: formName });
    }

    const form = await Form.create({
      title: formName,
      status: "draft",
      version: 1,
    });

    res.status(201).json({
      success: true,
      message: "Form created successfully",
      form,
    });
  } catch (error) {
    next(createError("Failed to create form", 500));
  }
};
