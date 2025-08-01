import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Form } from "../models/formbuilderForm";

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
    (req as any).user = decoded.user; // Now req.user contains the full user data (excluding password)
    next();
  });
};

export const checkFormAccess = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uniqueUrl } = req.params;

    const form = await Form.findOne({ uniqueUrl, status: "published" });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    req.form = form;

    // If form is public, allow access
    if (form.isPublic) {
      return next();
    }

    // If form has email restrictions, check session for verified browser email
    if (form.allowedEmails.length > 0) {
      const verifiedEmail = req.session?.verifiedBrowserEmail;

      if (!verifiedEmail || !form.allowedEmails.includes(verifiedEmail)) {
        return res.status(401).json({
          success: false,
          message: "email required",
          requiresBrowserLogin: true,
          allowedEmails: form.allowedEmails,
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
