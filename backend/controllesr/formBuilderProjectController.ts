import { Request, Response, NextFunction } from "express";
import { createError } from "../middlewares/errorHandler";
import { Project, Form } from "../models/Index";

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

    res.status(201).json({
      success: true,
      message: "Project and form linked/created successfully",
      project,
      form,
    });
  } catch (error) {
    console.log("error", error);
    next(createError("Failed to create or link project and form", 500));
  }
};
