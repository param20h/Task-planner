import { Router, Response } from "express";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { supabaseAdmin, supabaseAuth } from "../config/supabase";

const router = Router();

// POST /register — public
router.post("/register", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Upsert profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: data.user!.id, name, email }, { onConflict: "id" });

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    return res.status(201).json({ user: data.user, session: data.session });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /login — public
router.post("/login", async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ user: data.user, session: data.session });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /logout — protected
router.post("/logout", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /me — protected
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ user: req.user });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
