import { Schema, model, Document } from "mongoose";

export interface IPageCondition {
  questionId: Schema.Types.ObjectId;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in";
  value: string | number | string[];
  nextPageId: Schema.Types.ObjectId;
}

export interface IPage extends Document {
  _id: string;
  title: string;
  description?: string;
  order: number;
  nextPageId?: Schema.Types.ObjectId;
  conditions?: IPageCondition[];
  formId: Schema.Types.ObjectId;
  references?: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
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
    order: {
      type: Number,
      required: true,
    },
    nextPageId: {
      type: Schema.Types.ObjectId,
      ref: "Page",
    },
    conditions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        operator: {
          type: String,
          enum: [
            "equals",
            "not_equals",
            "contains",
            "greater_than",
            "less_than",
            "in",
            "not_in",
          ],
          required: true,
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
        },
        nextPageId: {
          type: Schema.Types.ObjectId,
          ref: "Page",
          required: true,
        },
      },
    ],
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Page = model<IPage>("Page", PageSchema);
