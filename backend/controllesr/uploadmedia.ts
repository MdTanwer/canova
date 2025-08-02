require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";

// Add this import!

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mediaType } = req.body;

    // Check if file exists in request
    if (!req.file && !req.body.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    let fileData;

    // Handle file from multer (if using multer middleware)
    if (req.file) {
      fileData = req.file.buffer.toString("base64");
      fileData = `data:${req.file.mimetype};base64,${fileData}`;
    }
    // Handle file from form-data body (base64 string)
    else if (req.body.file) {
      fileData = req.body.file;
    }

    // Upload to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(fileData, {
      folder: "media",
      resource_type: "auto", // This handles both images and videos
    });

    // Create media document
    const mediaData = {
      mediaType: mediaType || "image",
      file: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    };

    const media = await MediaModel.create(mediaData);

    res.status(201).json({
      success: true,
      media,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};
import mongoose, { Document, Model, Schema } from "mongoose";
export interface IMedia extends Document {
  mediaType: string;
  file: object;
}

const mediaSchema: Schema<IMedia> = new mongoose.Schema(
  {
    mediaType: {
      type: String,
      enum: ["image", "video"],
    },

    file: {
      public_id: {
        type: String,
        required: [true, "Cloudinary public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Cloudinary URL is required"],
      },
    },
  },
  { timestamps: true }
);

const MediaModel: Model<IMedia> = mongoose.model("Media", mediaSchema);

export default MediaModel;
