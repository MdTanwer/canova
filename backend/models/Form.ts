import { Schema, model, Document } from "mongoose";

export interface IForm extends Document {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "published" | "archived";
  PageIds?: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  projectId?: Schema.Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const FormSchema = new Schema<IForm>(
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
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    PageIds: {
      type: [Schema.Types.ObjectId],
      ref: "Page",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    version: {
      type: Number,
      default: 1,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Form = model<IForm>("Form", FormSchema);
