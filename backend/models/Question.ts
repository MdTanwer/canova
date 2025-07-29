import { model, Schema } from "mongoose";
export interface IQuestion extends Document {
  _id: string;
  formId: Schema.Types.ObjectId;
  pageId: Schema.Types.ObjectId;
  type:
    | "short"
    | "long"
    | "multiple-choice"
    | "time"
    | "rating"
    | "checkbox"
    | "dropdowns"
    | "date"
    | "LinearScale"
    | "upload";
  question: string;
  order: number;
  required: boolean;
  minLength?: number;
  selectedScale: Number;

  // 🆕 Reference media (when you show media and ask about it)
  referenceMedia?: {
    type: "image" | "video";
    url: string;
    filename: string;
    description?: string;
  };

  // Option-based questions
  options?: string[];

  // Text questions
  placeholder?: string;
  maxLength?: number;

  // Rating questions
  starCount?: number;

  // LinearScale questions
  scaleMin?: number;
  scaleMax?: number;
  scaleStartLabel?: string;
  scaleEndLabel?: string;
  dateAnswer?: Date;
  backgroundColor?: string;
  correctAnswer?: number; // For single-choice (multiple-choice, dropdowns)
  correctAnswers?: number[];

  selectedRating?: number;
  // Upload questions (when user uploads)
  maxFiles?: number;
  maxFileSizeMb?: number;
  allowedTypes?: ("image" | "video")[];
}

const QuestionSchema = new Schema<IQuestion>(
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
    type: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    correctAnswer: { type: Number }, // For single-choice (multiple-choice, dropdowns)
    correctAnswers: { type: [Number] },
    dateAnswer: {
      type: Date,
    },
    order: {
      type: Number,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    minLength: Number,
    backgroundColor: String,

    // 🆕 Reference media field
    referenceMedia: {
      type: {
        type: String,
        enum: ["image", "video"],
      },
      url: {
        type: String,
        required: function () {
          return this.referenceMedia?.type;
        },
      },
      filename: String,
      description: String,
    },

    // Existing fields...
    options: [String],
    placeholder: String,
    maxLength: Number,
    selectedScale: Number,
    selectedRating: Number,
    starCount: Number,
    scaleMin: Number,
    scaleMax: Number,
    scaleStartLabel: String,
    scaleEndLabel: String,
    maxFiles: Number,
    maxFileSizeMb: Number,
    allowedTypes: [String],
  },
  {
    timestamps: true,
  }
);

export const Question = model<IQuestion>("Question", QuestionSchema);

export interface IAnswer extends Document {
  _id: string;
  questionId: Schema.Types.ObjectId;
  pageId: Schema.Types.ObjectId;
  formResponseId: Schema.Types.ObjectId;
  questionType: string;

  // Different answer formats
  textAnswer?: string;
  selectedOptions?: string[];
  timeAnswer?: string;
  dateAnswer?: Date;
  ratingValue?: number;
  scaleValue?: number;

  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    pageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    formResponseId: {
      type: Schema.Types.ObjectId,
      ref: "FormResponse",
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },

    // Answer fields
    textAnswer: String,
    selectedOptions: [String],
    timeAnswer: String,
    dateAnswer: Date,
    ratingValue: Number,
    scaleValue: Number,
  },
  {
    timestamps: true,
  }
);

export const Answer = model<IAnswer>("Answer", AnswerSchema);

export interface IFormResponse extends Document {
  _id: string;
  formId: Schema.Types.ObjectId;
  currentPageId?: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  respondentEmail?: string;
  status: "in-progress" | "completed" | "abandoned";
  completedAt?: Date;
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
    currentPageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    respondentEmail: String,
    status: {
      type: String,
      enum: ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

export const FormResponse = model<IFormResponse>(
  "FormResponse",
  FormResponseSchema
);
