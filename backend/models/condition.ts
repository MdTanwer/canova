// ===== CONDITION MODEL =====
import { Schema, model, Document } from "mongoose";

export interface IConditionRule {
  questionId: Schema.Types.ObjectId;
  adminAnswer: string; // Expected answer for this specific question
}

export interface ICondition extends Document {
  _id: string;
  formId: Schema.Types.ObjectId;
  pageId: Schema.Types.ObjectId;
  questionIds: Schema.Types.ObjectId[]; // Array of question IDs
  rules: IConditionRule[]; // Array of question-answer pairs
  sourcePage: Schema.Types.ObjectId;
  destinationPage: Schema.Types.ObjectId;
  logicOperator: "AND" | "OR"; // How to combine multiple rules
  createdAt: Date;
  updatedAt: Date;
}

const ConditionSchema = new Schema<ICondition>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    rules: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        adminAnswer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    sourcePage: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    destinationPage: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    logicOperator: {
      type: String,
      enum: ["AND", "OR"],
      default: "AND",
    },
  },
  {
    timestamps: true,
  }
);

export const Condition = model<ICondition>("Condition", ConditionSchema);
