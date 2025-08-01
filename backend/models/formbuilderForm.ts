import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
  // New fields for access control
  isPublic: boolean;
  allowedEmails: string[];
  uniqueUrl?: string;
}

const FormSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
      // required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },

    // New access control fields
    isPublic: {
      type: Boolean,
      default: false,
    },

    allowedEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    uniqueUrl: {
      type: String,
      unique: true,
      sparse: true,
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

// Generate unique URL when form is published
FormSchema.pre("save", function (next) {
  if (this.status === "draft" && !this.uniqueUrl) {
    this.uniqueUrl = uuidv4();
  }
  next();
});

export const Form = model<IForm>("Form", FormSchema);
