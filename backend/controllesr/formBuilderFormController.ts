import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Form, Page } from "../models/Index";
import { AccessPermission } from "../models/formbuilderForm";
import { v4 as uuidv4 } from "uuid";

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
      backgroundColor: form.backgroundColor,
    });
  } catch (error) {
    next(createError("Failed to fetch form name", 500));
  }
};

// POST: Publish form (requires authentication)
interface EmailAccessRequest {
  email: string;
  permissions: AccessPermission[];
}

export const formPublish = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    const {
      isPublic,
      allowedEmails, // For backward compatibility
      emailAccess, // New granular access control
      projectId,
    } = req.body;

    // Find form and check if it exists
    const form = await Form.findById(formId);

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    // Uncomment if you want to restrict to form owner only
    // if (form.createdBy.toString() !== req.user._id.toString()) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Only form owner can publish" });
    // }

    const uniqueUrl = uuidv4();

    // Generate shareable link
    const shareableLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/public/${uniqueUrl}`;

    // Prepare update data
    const updateData: any = {
      status: "published",
      publishedAt: new Date(),
      isPublic: isPublic || false,
      allowedEmails: [], // Clear old allowed emails
      emailAccess: [], // Clear old email access
      shareUrl: shareableLink,
      uniqueUrl: uniqueUrl,
      isShared: true,
    };

    // Add project ID if provided
    if (projectId) {
      updateData.projectId = projectId;
    }

    // Handle granular email access control
    if (emailAccess && Array.isArray(emailAccess)) {
      // Validate and process email access requests
      const processedEmailAccess = [];

      for (const accessItem of emailAccess) {
        if (!accessItem.email || !accessItem.permissions) {
          return res.status(400).json({
            success: false,
            message: "Each email access item must have email and permissions",
          });
        }

        // Validate permissions
        const validPermissions = accessItem.permissions.filter((perm: string) =>
          Object.values(AccessPermission).includes(perm as AccessPermission)
        );

        if (validPermissions.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid permissions for email ${accessItem.email}. Valid permissions are: ${Object.values(AccessPermission).join(", ")}`,
          });
        }

        processedEmailAccess.push({
          email: accessItem.email.toLowerCase().trim(),
          permissions: validPermissions,
          grantedBy: req.user?._id || form.createdBy,
          grantedAt: new Date(),
        });
      }

      updateData.emailAccess = processedEmailAccess;
    }
    // Handle backward compatibility with allowedEmails
    else if (!isPublic && allowedEmails && Array.isArray(allowedEmails)) {
      // Convert allowedEmails to new emailAccess format (VIEW permission only)
      updateData.emailAccess = allowedEmails.map((email: string) => ({
        email: email.toLowerCase().trim(),
        permissions: [AccessPermission.VIEW],
        grantedBy: req.user?._id || form.createdBy,
        grantedAt: new Date(),
      }));

      // Also set allowedEmails for backward compatibility
      updateData.allowedEmails = allowedEmails.map((email: string) =>
        email.toLowerCase().trim()
      );
    }

    // Update form
    const updatedForm = await Form.findByIdAndUpdate(formId, updateData, {
      new: true,
    });

    if (!updatedForm) {
      return res.status(500).json({
        success: false,
        message: "Failed to update form",
      });
    }

    // Prepare response with access summary
    const accessSummary = updatedForm.emailAccess.map((access) => ({
      email: access.email,
      permissions: access.permissions,
      grantedAt: access.grantedAt,
    }));

    res.json({
      success: true,
      message: "Form published successfully",
      data: {
        formId: updatedForm._id,
        uniqueUrl: updatedForm.uniqueUrl, // Now served from database
        shareUrl: updatedForm.shareUrl, // Now served from database
        isPublic: updatedForm.isPublic,
        projectId: updatedForm.projectId,
        status: updatedForm.status,
        publishedAt: updatedForm.publishedAt,
        accessControl: {
          isPublic: updatedForm.isPublic,
          emailAccess: accessSummary,
          // Backward compatibility
          allowedEmails: updatedForm.allowedEmails,
        },
      },
    });
  } catch (error) {
    console.error("Form publish error:", error);
    next(error);
  }
};
// Backend API Routes

export const getFormShareUrl = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;

    // Find form by ID
    const form = await Form.findById(formId);

    if (!form) {
      return res
        .status(404)
        .json({ success: false, message: "Form not found" });
    }

    // Check if form is published
    if (form.status !== "published") {
      return res
        .status(400)
        .json({ success: false, message: "Form is not published" });
    }

    res.json({
      success: true,
      data: {
        shareableLink: form.shareUrl,
      },
    });
  } catch (error) {
    console.error("Get form share URL error:", error);
    next(error);
  }
};
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

    // Check if email is allowed in emailAccess array
    const emailAccessEntry = form.emailAccess.find(
      (entry: any) => entry.email.toLowerCase() === email.toLowerCase()
    );

    if (!emailAccessEntry) {
      return res.status(403).json({
        success: false,
        message: "Your email is not authorized to access this form",
      });
    }

    // Email is verified, return full form data with user permissions
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
      // Optional: include user permissions for future use
      userPermissions: emailAccessEntry.permissions,
      userEmail: emailAccessEntry.email,
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// API to update form background color
export const updateFormBackgroundColor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    const { backgroundColor } = req.body;

    // Validate required fields
    if (!backgroundColor) {
      return next(createError("Background color is required", 400));
    }

    // Validate color format (hex, rgb, rgba, or named colors)
    const colorRegex =
      /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[01]?\.?\d*\)|[a-zA-Z]+)$/;
    if (!colorRegex.test(backgroundColor)) {
      return next(createError("Invalid color format", 400));
    }

    // Find and update the form
    const form = await Form.findById(formId);
    if (!form) {
      return next(createError("Form not found", 404));
    }

    form.backgroundColor = backgroundColor;
    await form.save();

    res.status(200).json({
      success: true,
      message: "Form background color updated successfully",
      form: {
        _id: form._id,
        title: form.title,
        backgroundColor: form.backgroundColor,
        updatedAt: form.updatedAt,
      },
    });
  } catch (error) {
    next(createError("Failed to update form background color", 500));
  }
};

// API to update form description
export const updateFormDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    const { description } = req.body;

    // Validate required fields
    if (description === undefined || description === null) {
      return next(createError("Description is required", 400));
    }

    // Optional: Validate description length
    if (typeof description === "string" && description.length > 1000) {
      return next(
        createError("Description must be less than 1000 characters", 400)
      );
    }

    // Find and update the form
    const form = await Form.findById(formId);
    if (!form) {
      return next(createError("Form not found", 404));
    }

    form.description = description;
    await form.save();

    res.status(200).json({
      success: true,
      message: "Form description updated successfully",
      form: {
        _id: form._id,
        title: form.title,
        description: form.description,
        updatedAt: form.updatedAt,
      },
    });
  } catch (error) {
    next(createError("Failed to update form description", 500));
  }
};

// Optional: Combined API to update both background color and description
export const updateFormDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    const { backgroundColor, description } = req.body;

    // Validate at least one field is provided
    if (!backgroundColor && description === undefined) {
      return next(
        createError(
          "At least one field (backgroundColor or description) is required",
          400
        )
      );
    }

    // Find the form
    const form = await Form.findById(formId);
    if (!form) {
      return next(createError("Form not found", 404));
    }

    // Update fields if provided
    if (backgroundColor) {
      const colorRegex =
        /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)|rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*[01]?\.?\d*\)|[a-zA-Z]+)$/;
      if (!colorRegex.test(backgroundColor)) {
        return next(createError("Invalid color format", 400));
      }
      form.backgroundColor = backgroundColor;
    }

    if (description !== undefined) {
      if (typeof description === "string" && description.length > 1000) {
        return next(
          createError("Description must be less than 1000 characters", 400)
        );
      }
      form.description = description;
    }

    await form.save();

    res.status(200).json({
      success: true,
      message: "Form details updated successfully",
      form: {
        _id: form._id,
        title: form.title,
        backgroundColor: form.backgroundColor,
        description: form.description,
        updatedAt: form.updatedAt,
      },
    });
  } catch (error) {
    next(createError("Failed to update form details", 500));
  }
};
