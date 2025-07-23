import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  _id: string;
  name: string;
  description?: string;
  forms: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  collaborators?: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    forms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Form",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>("Project", ProjectSchema);
