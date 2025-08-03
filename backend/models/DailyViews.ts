import { Schema, model, Document } from "mongoose";

export interface IDailyViews extends Document {
  formId: Schema.Types.ObjectId;
  date: Date; // Date in YYYY-MM-DD format
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyViewsSchema = new Schema<IDailyViews>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient querying
DailyViewsSchema.index({ formId: 1, date: 1 }, { unique: true });

export const DailyViews = model<IDailyViews>("DailyViews", DailyViewsSchema);
