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

    // if (form.createdBy.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Only form owner can publish" });
    // }

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
      shareableLink: `${process.env.FRONTEND_URL || "http://localhost:5173"}/public/${updatedForm?.uniqueUrl}`,
      isPublic: updatedForm?.isPublic,
      allowedEmails: updatedForm?.allowedEmails,
    });
  } catch (error) {
    next(error);
  }
};
// Backend API Routes

// GET: Check form access and return form data
export const getFormByUniqueUrl = async (req: Request, res: Response) => {
  try {
    const { uniqueUrl } = req.params;

    // Find the form
    const form = await Form.findOne({ uniqueUrl, status: "published" });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // If form is public, return form data immediately
    if (form.isPublic) {
      return res.json({
        success: true,
        form: {
          id: form._id,
          title: form.title,
          description: form.description,
          PageIds: form.PageIds,
          isPublic: true,
          requiresEmail: false,
        },
      });
    }

    // If form is restricted, return form info but indicate email verification needed
    return res.json({
      success: true,
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        isPublic: false,
        requiresEmail: true,
      },
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST: Verify email for restricted forms
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { uniqueUrl } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find the form
    const form = await Form.findOne({ uniqueUrl, status: "published" });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Check if email is allowed
    const isEmailAllowed = form.allowedEmails.includes(email.toLowerCase());

    if (!isEmailAllowed) {
      return res.status(403).json({
        success: false,
        message: "Your email is not authorized to access this form",
      });
    }

    // Email is verified, return full form data
    res.json({
      success: true,
      message: "Email verified successfully",
      form: {
        id: form._id,
        title: form.title,
        description: form.description,
        PageIds: form.PageIds,
        isPublic: false,
        requiresEmail: false, // Now they have access
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Routes setup
// app.get('/api/forms/:uniqueUrl', getForm);
// app.post('/api/forms/:uniqueUrl/verify-email', verifyEmail);
