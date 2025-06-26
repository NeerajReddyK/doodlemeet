import { jwtSecret } from "@repo/common-backend/jwtSecret";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export function userMiddleware(req: AuthenticatedRequest , res: Response, next: NextFunction) {
  try {
    const auth = req.headers["authorization"];
    if(!auth) {
      res.status(402).json({
        message: "User not authenticated, token absent"
      });
      return;
    }
    const token = auth.split(" ")[1];

    if(!jwtSecret) {
      console.log("Undefined jwtSecret");
      res.status(500).json({
        message: "Undefined jwtSecret"
      });
      return;
    }
    if(!token) {
      res.status(402).json({
        messsage: "issue with token"
      });
      return;
    }
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if(!decoded) {
      res.status(401).json({
        message: "User not authenticated"
      })
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch(error) {
    console.log("Error in userMiddleware");
    res.status(500).json({
      message: "Server error in userMiddleware"
    })
  }
}

// there are some changes compared to the original version. if anything fails, check.