import { Request, Response, NextFunction } from "express";
import { supabaseAuth } from "../config/supabase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_metadata: Record<string, any>;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email || "",
      user_metadata: data.user.user_metadata || {},
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
}
