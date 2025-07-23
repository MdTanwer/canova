import { Schema, model, Document } from "mongoose";

export interface IAnswerOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  value?: string;
}

export interface IQuestionSettings {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  isRequired?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowMultiple?: boolean;
}

export interface IQuestion extends Document {
  _id: string;
  title: string;
  description?: string;
  type:
    | "short_answer"
    | "long_answer"
    | "multiple_choice"
    | "checkbox"
    | "dropdown"
    | "date"
    | "rating";
  answerOptions?: IAnswerOption[];
  correctAnswer?: string | string[];
  defaultAnswer?: string | string[];
  settings: IQuestionSettings;
  references?: Schema.Types.ObjectId[];
  order: number;
  sectionId?: Schema.Types.ObjectId;
  pageId: Schema.Types.ObjectId;
  formId: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "short_answer",
        "long_answer",
        "multiple_choice",
        "checkbox",
        "dropdown",
        "date",
        "rating",
      ],
      required: true,
    },
    answerOptions: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
        value: { type: String },
      },
    ],
    correctAnswer: {
      type: Schema.Types.Mixed,
    },
    defaultAnswer: {
      type: Schema.Types.Mixed,
    },
    settings: {
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#000000" },
      fontSize: { type: Number, default: 14 },
      isRequired: { type: Boolean, default: false },
      placeholder: { type: String },
      minLength: { type: Number },
      maxLength: { type: Number },
      minValue: { type: Number },
      maxValue: { type: Number },
      allowMultiple: { type: Boolean, default: false },
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    order: {
      type: Number,
      required: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Question = model<IQuestion>("Question", QuestionSchema);
