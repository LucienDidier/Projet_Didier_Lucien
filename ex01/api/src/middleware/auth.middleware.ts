import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/tokens";

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.header("Authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match || !verifyAccessToken(match[1])) {
    res.status(401).json({ message: "Authentication is required." });
    return;
  }

  next();
}
