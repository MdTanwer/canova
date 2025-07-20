import mongoose, { Document, Schema } from "mongoose";

// Define the TypeScript interface for the User model
export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  otpToken: string;
  otp: number;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Schema for the User model
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpToken: { type: String },
    otpExpires: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create the Mongoose model for User
const User = mongoose.model<IUser>("User", userSchema);

export default User;
