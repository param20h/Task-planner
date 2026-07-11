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
      if (process.env.NODE_ENV === "development") {
        try {
          const payloadParts = token.split(".");
          if (payloadParts.length === 3) {
            const payloadBuf = Buffer.from(payloadParts[1], "base64");
            const payload = JSON.parse(payloadBuf.toString("utf-8"));
            if (payload && payload.sub) {
              req.user = {
                id: payload.sub,
                email: payload.email || "",
                user_metadata: payload.user_metadata || {},
              };
              console.log("Offline Fallback Auth: Decoded token payload in development mode");
              next();
              return;
            }
          }
        } catch (jwtErr) {
          console.error("Offline Fallback Auth failed to parse token:", jwtErr);
        }
      }
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
    if (process.env.NODE_ENV === "development") {
      try {
        const payloadParts = token.split(".");
        if (payloadParts.length === 3) {
          const payloadBuf = Buffer.from(payloadParts[1], "base64");
          const payload = JSON.parse(payloadBuf.toString("utf-8"));
          if (payload && payload.sub) {
            req.user = {
              id: payload.sub,
              email: payload.email || "",
              user_metadata: payload.user_metadata || {},
            };
            console.log("Offline Fallback Auth: Decoded token payload in development mode (exception path)");
            next();
            return;
          }
        }
      } catch (jwtErr) {
        console.error("Offline Fallback Auth failed to parse token on exception:", jwtErr);
      }
    }
    res.status(401).json({ error: "Authentication failed" });
  }
}
