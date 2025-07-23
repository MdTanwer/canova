import { Schema, model, Document } from "mongoose";

export interface IReference extends Document {
  _id: string;
  title: string;
  description?: string;
  type: "image" | "video" | "document" | "link";
  url: string;
  thumbnail?: string;
  fileSize?: number;
  duration?: number; // for videos
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferenceSchema = new Schema<IReference>(
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
      enum: ["image", "video", "document", "link"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    duration: {
      type: Number,
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

export const Reference = model<IReference>("Reference", ReferenceSchema);
