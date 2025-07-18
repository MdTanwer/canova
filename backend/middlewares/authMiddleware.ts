import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"; // This should be in an environment variable

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    return res.status(403).json({ success: false, message: "Token not found" });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Attach the full user data to the request object
    req.user = decoded.user; // Now req.user contains the full user data (excluding password)
    next();
  });
};
