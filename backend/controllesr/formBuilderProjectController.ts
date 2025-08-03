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

// Get all projects with id, name, type, status, isShared and associated form id and name
export const getAllProjectsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const projects = await Project.find().populate({
      path: "forms",
      select: "title _id status isShared",
    });

    // Map projects with their forms
    const projectsResult = projects.map((project: any) => ({
      id: project._id,
      name: project.name,
      type: project.type,
      status: project.status,
      isShared: project.isShared, // Fetch actual isShared from database
    }));

    // Find forms not associated with any project
    const Form = require("../models/Index").Form;
    const unassignedForms = await Form.find({
      $or: [{ projectId: { $exists: false } }, { projectId: null }],
    }).select("title _id status isShared");

    // Map unassigned forms to match the same structure
    const unassignedFormsResult = unassignedForms.map((form: any) => ({
      id: form._id,
      name: form.title,
      type: "form",
      status: form.status, // Fetch actual status from database
      isShared: form.isShared, // Fetch actual isShared from database
    }));

    // Combine both arrays
    const combinedResults = [...projectsResult, ...unassignedFormsResult];

    res.json({
      success: true,
      data: combinedResults,
    });
  } catch (error) {
    next(createError("Failed to fetch projects summary", 500));
  }
};

// Delete by id (project or form)
export const deleteById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(createError("id is required", 400));
    }
    // Try to find and delete as a project
    const project = await Project.findByIdAndDelete(id);
    if (project) {
      return res.status(200).json({
        success: true,
        message: "Project deleted",
        type: "project",
        id,
      });
    }
    // Try to find and delete as a form
    const Form = require("../models/Index").Form;
    const form = await Form.findByIdAndDelete(id);
    if (form) {
      return res
        .status(200)
        .json({ success: true, message: "Form deleted", type: "form", id });
    }
    return next(createError("No project or form found with this id", 404));
  } catch (error) {
    next(createError("Failed to delete by id", 500));
  }
};


export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all projects, selecting only name and _id fields
    const projects = await Project.find(
      {}, // Empty filter to get all projects
      { name: 1, _id: 1, createdAt: 1, updatedAt: 1 } // Select only specific fields
    )
    .sort({ createdAt: -1 }) // Sort by newest first
    .lean(); // Use lean() for better performance since we don't need full documents

    // Transform the data to have consistent field names
    const projectList = projects.map(project => ({
      id: project._id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      count: projectList.length,
      projects: projectList
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    next(createError("Failed to retrieve projects", 500));
  }
};