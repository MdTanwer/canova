import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Project, Form, Page } from "../models/Index";

export const createProjectWithForm = async (
  req: Request,
  // & { user?: { _id: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const { formName, projectName } = req.body;
    // const userId = req.user?._id;

    if (!formName || !projectName) {
      return next(createError("formName and projectName are required", 400));
    }
    // if (!userId) {
    //   return next(createError("User not authenticated", 401));
    // }

    // Try to find an existing form with the same name and user
    let form = await Form.findOne({
      title: formName,
      //  createdBy: userId
    });

    // If not found, create a new form
    if (!form) {
      form = await Form.create({
        title: formName,
        // createdBy: userId,
        projectId: undefined, // will set after project is created
        status: "draft",
        version: 1,
      });
    }

    // Create the project and link the form
    const project = await Project.create({
      name: projectName,
      forms: [form._id as any], // ✅ Type assertion
      // createdBy: userId,
    });

    // Update form's projectId if it was just created
    if (!form.projectId) {
      form.projectId = project._id as any; // ✅ Type assertion
      await form.save();
    }

    // Create a new page named 'page01' linked to the form
    const page = await Page.create({
      title: "page01",
      order: 1,
      formId: form._id,
      // createdBy: form.createdBy, // or userId if available
    });
    // Optionally, add the page to the form's PageIds array
    if (form.PageIds) {
      form.PageIds.push(page._id as any);
    } else {
      form.PageIds = [page._id as any];
    }
    await form.save();

    res.status(201).json({
      success: true,
      message: "Project, form, and page created successfully",
      project,
      form,
      page,
    });
  } catch (error) {
    console.log("error", error);
    next(createError("Failed to create or link project and form", 500));
  }
};

export const renameProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, newName } = req.body;
    if (!projectId || !newName) {
      return next(createError("projectId and newName are required", 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(createError("Project not found", 404));
    }

    project.name = newName;
    await project.save();

    res.status(200).json({
      success: true,
      message: "Project renamed successfully",
      project,
    });
  } catch (error) {
    next(createError("Failed to rename project", 500));
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return next(createError("projectId is required", 400));
    }

    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return next(createError("Project not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    next(createError("Failed to delete project", 500));
  }
};

export const createNextPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.params;
    if (!formId) {
      return next(createError("formId is required", 400));
    }

    // Find all pages for the form, sorted by order
    const pages = await Page.find({ formId }).sort({ order: 1 });

    // Determine the next order and title
    const nextOrder = pages.length + 1;
    const nextTitle = `page${nextOrder.toString().padStart(2, "0")}`;

    // Create the new page
    const newPage = await Page.create({
      title: nextTitle,
      order: nextOrder,
      formId,
      // createdBy: ... // add if you have user context
    });

    // Optionally, add the new page to the form's PageIds array
    const form = await Form.findById(formId);
    if (form) {
      if (form.PageIds) {
        form.PageIds.push(newPage._id as any);
      } else {
        form.PageIds = [newPage._id as any];
      }
      await form.save();
    }

    res.status(201).json({
      success: true,
      page: newPage,
    });
  } catch (error) {
    next(createError("Failed to create next page", 500));
  }
};
