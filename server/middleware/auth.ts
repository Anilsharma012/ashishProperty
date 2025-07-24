import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userType?: string;
  email?: string;
}

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    (req as any).userId = decoded.userId;
    (req as any).userType = decoded.userType;
    (req as any).email = decoded.email;
    next();
  });
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const userType = (req as any).userType;

  if (userType !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  next();
};

export const requireSellerOrAgent: RequestHandler = (req, res, next) => {
  const userType = (req as any).userType;

  if (!["seller", "agent", "admin"].includes(userType)) {
    return res.status(403).json({
      success: false,
      error: "Seller or agent access required",
    });
  }

  next();
};
