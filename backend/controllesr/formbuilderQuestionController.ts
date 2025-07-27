import { Request, Response } from "express";
import { Question, IQuestion } from "../models/Question";
import { Page } from "../models/Page";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads (reference media)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = "uploads/reference-media";
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed!"));
    }
  },
});

// Middleware for handling file upload
export const uploadReferenceMedia = upload.single("referenceMedia");

// 📝 CREATE QUESTION
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const {
      formId,
      pageId,
      type,
      question,
      order,
      required = false,

      // Optional fields based on question type
      options,
      placeholder,
      maxLength,
      minLength,
      starCount,
      scaleMin,
      scaleMax,
      scaleStartLabel,
      scaleEndLabel,
      maxFiles,
      maxFileSizeMb,
      allowedTypes,

      // Reference media description (if file uploaded)
      referenceMediaDescription,
    } = req.body;

    // Validate required fields
    if (!formId || !pageId || !type || !question) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: formId, pageId, type, question",
      });
    }

    // Validate page exists
    const pageExists = await Page.findById(pageId);
    if (!pageExists) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Validate question type
    const validTypes = [
      "short",
      "long",
      "multiple-choice",
      "time",
      "rating",
      "checkbox",
      "dropdowns",
      "date",
      "LinearScale",
      "upload",
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question type",
      });
    }

    // Prepare question data
    const questionData: Partial<IQuestion> = {
      formId,
      pageId,
      type,
      question: question.trim(),
      order: order || 0,
      required,
    };

    // Handle reference media if uploaded
    if (req.file) {
      const fileType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "video";
      questionData.referenceMedia = {
        type: fileType,
        url: `/uploads/reference-media/${req.file.filename}`, // Adjust based on your setup
        filename: req.file.filename,
        description: referenceMediaDescription || "",
      };
    }

    // Set type-specific fields
    switch (type) {
      case "multiple-choice":
      case "checkbox":
      case "dropdowns":
        if (!options || !Array.isArray(options) || options.length < 2) {
          return res.status(400).json({
            success: false,
            message: `${type} questions must have at least 2 options`,
          });
        }
        questionData.options = options.map((opt: string) => opt.trim());
        break;

      case "short":
      case "long":
        questionData.placeholder = placeholder;
        questionData.maxLength = maxLength;
        questionData.minLength = minLength;
        break;

      case "rating":
        questionData.starCount = starCount || 5;
        if (
          (questionData.starCount ?? 5) < 1 ||
          (questionData.starCount ?? 5) > 10
        ) {
          return res.status(400).json({
            success: false,
            message: "Star count must be between 1 and 10",
          });
        }
        break;

      case "LinearScale":
        questionData.scaleMin = scaleMin || 0;
        questionData.scaleMax = scaleMax || 10;
        questionData.scaleStartLabel = scaleStartLabel || "Poor";
        questionData.scaleEndLabel = scaleEndLabel || "Excellent";

        if ((questionData.scaleMin ?? 0) >= (questionData.scaleMax ?? 10)) {
          return res.status(400).json({
            success: false,
            message: "Scale minimum must be less than maximum",
          });
        }
        break;

      case "upload":
        questionData.maxFiles = maxFiles || 1;
        questionData.maxFileSizeMb = maxFileSizeMb || 5;
        questionData.allowedTypes = allowedTypes || ["image"];

        if (
          (questionData.maxFiles ?? 1) < 1 ||
          (questionData.maxFiles ?? 1) > 10
        ) {
          return res.status(400).json({
            success: false,
            message: "Max files must be between 1 and 10",
          });
        }
        break;
    }

    // Create and save question
    const newQuestion = new Question(questionData);
    const savedQuestion = await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: savedQuestion,
    });
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// 📖 GET QUESTIONS BY PAGE
export const getQuestionsByPage = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;

    const questions = await Question.find({ pageId })
      .sort({ order: 1 })
      .populate("pageId", "title")
      .populate("formId", "title");

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
};

// 📖 GET SINGLE QUESTION
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate("pageId", "title")
      .populate("formId", "title");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
    });
  }
};

// ✏️ UPDATE QUESTION
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Handle reference media update if new file uploaded
    if (req.file) {
      const fileType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "video";
      updateData.referenceMedia = {
        type: fileType,
        url: `/uploads/reference-media/${req.file.filename}`,
        filename: req.file.filename,
        description: updateData.referenceMediaDescription || "",
      };

      // Delete old reference media file if exists
      const existingQuestion = await Question.findById(questionId);
      if (existingQuestion?.referenceMedia?.filename) {
        try {
          await fs.unlink(
            `uploads/reference-media/${existingQuestion.referenceMedia.filename}`
          );
        } catch (err) {
          console.warn("Failed to delete old reference media file");
        }
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
    });
  }
};

// 🗑️ DELETE QUESTION
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Delete reference media file if exists
    if (question.referenceMedia?.filename) {
      try {
        await fs.unlink(
          `uploads/reference-media/${question.referenceMedia.filename}`
        );
      } catch (err) {
        console.warn("Failed to delete reference media file");
      }
    }

    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
    });
  }
};

// 🔄 REORDER QUESTIONS
export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;
    const { questionIds } = req.body; // Array of question IDs in new order

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        message: "questionIds must be an array",
      });
    }

    // Update order for each question
    const updatePromises = questionIds.map(
      (questionId: string, index: number) =>
        Question.findByIdAndUpdate(questionId, { order: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Questions reordered successfully",
    });
  } catch (error) {
    console.error("Reorder questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder questions",
    });
  }
};

// 📋 BULK CREATE QUESTIONS
export const bulkCreateQuestions = async (req: Request, res: Response) => {
  try {
    const { pageId, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required",
      });
    }

    // Validate page exists
    const pageExists = await Page.findById(pageId);
    if (!pageExists) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Prepare questions with pageId and order
    const questionsToCreate = questions.map((q: any, index: number) => ({
      ...q,
      pageId,
      order: index,
    }));

    const createdQuestions = await Question.insertMany(questionsToCreate);

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      data: createdQuestions,
    });
  } catch (error) {
    console.error("Bulk create questions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create questions",
    });
  }
};
