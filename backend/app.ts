import { Request, Response } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { userRouter } from "./routers/userRouter";
import { errorHandler } from "./middlewares/errorHandler";
import connectDB from "./utils/db";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRouter);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    service: " API working successfully",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server with Socket.IO
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

// Run the server
startServer();

export default app;
