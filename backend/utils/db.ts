import mongoose from "mongoose";

// Simple connect function
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://tanwirisrafil:hSW1lfw5OO1iKfvm@demo.ldotqmm.mongodb.net/?retryWrites=true&w=majority&appName=CRM-C"
    );

    //  "mongodb+srv://tanwirisrafil:hSW1lfw5OO1iKfvm@demo.ldotqmm.mongodb.net/?retryWrites=true&w=majority&appName=demo"
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
