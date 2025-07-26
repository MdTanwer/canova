import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Form, Page } from "../models/Index";

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

    // Create the first page (page01) for the new form
    const page = await Page.create({
      title: "page01",
      order: 1,
      formId: form._id,
      // createdBy: ... // add if you have user context
    });
    // Optionally, add the page to the form's PageIds array
    form.PageIds = [page._id as any];
    await form.save();

    res.status(201).json({
      success: true,
      message: "Form and first page created successfully",
      form,
      page,
    });
  } catch (error) {
    next(createError("Failed to create form", 500));
  }
};

export const getPagesByFormId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return next(createError("formId is required", 400));
    }
    const pages = await Page.find({ formId });
    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    next(createError("Failed to fetch pages", 500));
  }
};

export const getFormNameById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return next(createError("formId is required", 400));
    }
    const form = await Form.findById(formId);
    if (!form) {
      return next(createError("Form not found", 404));
    }
    res.status(200).json({
      success: true,
      formName: form.title,
    });
  } catch (error) {
    next(createError("Failed to fetch form name", 500));
  }
};
