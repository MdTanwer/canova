import { Schema, model, Document } from "mongoose";

export interface ISectionSettings {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  padding?: number;
  margin?: number;
}

export interface ISection extends Document {
  _id: string;
  title: string;
  description?: string;
  settings: ISectionSettings;
  order: number;
  pageId: Schema.Types.ObjectId;
  formId: Schema.Types.ObjectId;
  references?: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
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
    settings: {
      backgroundColor: { type: String, default: "#f8f9fa" },
      textColor: { type: String, default: "#000000" },
      borderColor: { type: String, default: "#dee2e6" },
      padding: { type: Number, default: 16 },
      margin: { type: Number, default: 8 },
    },
    order: {
      type: Number,
      required: true,
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
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
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

export const Section = model<ISection>("Section", SectionSchema);
