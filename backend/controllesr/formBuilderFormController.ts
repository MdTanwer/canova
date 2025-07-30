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

// POST: Publish form (requires authentication)
export const formPublich = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    const { isPublic, allowedEmails } = req.body;

    // Find form and check if user is owner
    const form = await Form.findById(formId);

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    if (form.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only form owner can publish" });
    }

    // Update form with publish settings
    const updateData: any = {
      status: "published",
      publishedAt: new Date(),
      isPublic: isPublic || false,
      allowedEmails: [],
    };

    // If not public, set allowed emails
    if (!isPublic && allowedEmails && Array.isArray(allowedEmails)) {
      updateData.allowedEmails = allowedEmails.map((email: string) =>
        email.toLowerCase().trim()
      );
    }

    const updatedForm = await Form.findByIdAndUpdate(formId, updateData, {
      new: true,
    });

    res.json({
      success: true,
      message: "Form published successfully",
      uniqueUrl: updatedForm?.uniqueUrl,
      shareableLink: `${process.env.FRONTEND_URL || "http://localhost:3000"}/form/${updatedForm?.uniqueUrl}`,
      isPublic: updatedForm?.isPublic,
      allowedEmails: updatedForm?.allowedEmails,
    });
  } catch (error) {
    next(error);
  }
};

export const getFormByUniqueUrl = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const form = req.form;

    // Return form data (access already validated by middleware)
    res.json({
      success: true,
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        PageIds: form.PageIds,
        isPublic: form.isPublic,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST: Verify browser email for restricted forms
export const verifyBrowserEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uniqueUrl } = req.params;
    const { browserEmail } = req.body; // Frontend will send detected browser email

    const form = await Form.findOne({ uniqueUrl, status: "published" });

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    if (form.isPublic) {
      return res.status(400).json({
        success: false,
        message: "This form is public, no verification needed",
      });
    }

    if (!form.allowedEmails.includes(browserEmail.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Your browser email is not authorized to access this form",
      });
    }

    // Store verified browser email in session
    req.session.verifiedBrowserEmail = browserEmail.toLowerCase();

    res.json({
      success: true,
      message: "Browser email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};
