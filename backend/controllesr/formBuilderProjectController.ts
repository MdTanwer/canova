import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Project, Form, Page, DailyViews } from "../models/Index";

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
    const { id } = req.params;
    const { name } = req.body;
    
    if (!id || !name) {
      return next(createError("Project id and name are required", 400));
    }

    const project = await Project.findById(id);
    if (!project) {
      return next(createError("Project not found", 404));
    }

    project.name = name;
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

export const getProjectAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    
    if (!projectId) {
      return next(createError("Project ID is required", 400));
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return next(createError("Project not found", 404));
    }

    // Get all forms for this project with their views
    const forms = await Form.find(
      { projectId },
      { 
        _id: 1, 
        title: 1, 
        views: 1, 
        status: 1, 
        createdAt: 1, 
        updatedAt: 1,
        uniqueUrl: 1
      }
    ).sort({ createdAt: -1 });

    // Calculate analytics
    const totalViews = forms.reduce((sum, form) => sum + (form.views || 0), 0);
    const totalForms = forms.length;
    const publishedForms = forms.filter(form => form.status === 'published').length;
    const draftForms = forms.filter(form => form.status === 'draft').length;
    const averageViewsPerForm = totalForms > 0 ? Math.round(totalViews / totalForms) : 0;

    // Transform forms data
    const formsData = forms.map(form => ({
      id: form._id,
      title: form.title,
      views: form.views || 0,
      status: form.status,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      uniqueUrl: form.uniqueUrl
    }));

    // Get top performing forms (top 5 by views)
    const topForms = [...formsData]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Get daily view data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const formIds = forms.map(form => form._id);
    
    // Aggregate daily views for all forms in the project
    const dailyViews = await DailyViews.aggregate([
      {
        $match: {
          formId: { $in: formIds },
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: "$date",
          totalViews: { $sum: "$views" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create array of last 7 days with view data
    const dailyViewsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setUTCHours(0, 0, 0, 0);
      
      const dayData = dailyViews.find((dv: any) => 
        new Date(dv._id).toDateString() === date.toDateString()
      );
      
      dailyViewsData.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: dayData ? dayData.totalViews : 0
      });
    }

    res.status(200).json({
      success: true,
      message: "Project analytics retrieved successfully",
      data: {
        project: {
          id: project._id,
          name: project.name,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt
        },
        analytics: {
          totalViews,
          totalForms,
          publishedForms,
          draftForms,
          averageViewsPerForm
        },
        forms: formsData,
        topForms,
        dailyViews: dailyViewsData
      }
    });

  } catch (error) {
    console.error('Get project analytics error:', error);
    next(createError("Failed to retrieve project analytics", 500));
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