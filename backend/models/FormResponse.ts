import { Schema, model, Document } from "mongoose";

export interface IAnswerResponse {
  questionId: Schema.Types.ObjectId;
  answer: string | string[] | number | boolean;
  answeredAt: Date;
}

export interface IFormResponse extends Document {
  _id: string;
  formId: Schema.Types.ObjectId;
  respondentId?: Schema.Types.ObjectId; // null if anonymous
  respondentEmail?: string;
  responses: IAnswerResponse[];
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  currentPageId?: Schema.Types.ObjectId;
  score?: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeSpent?: number; // in seconds
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormResponseSchema = new Schema<IFormResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    respondentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    respondentEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    responses: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: Schema.Types.Mixed,
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    currentPageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
    },
    score: {
      type: Number,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answeredQuestions: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
FormResponseSchema.index({ formId: 1, status: 1 });
FormResponseSchema.index({ respondentId: 1 });
FormResponseSchema.index({ respondentEmail: 1 });
FormResponseSchema.index({ completedAt: 1 });

export const FormResponse = model<IFormResponse>(
  "FormResponse",
  FormResponseSchema
);
