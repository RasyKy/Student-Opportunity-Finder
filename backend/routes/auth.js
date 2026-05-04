import express from "express";
import { supabase, supabaseAdmin } from "../config/database.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const COOKIE_NAME = "sof_admin_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
};

// Register - Student or Organizer only
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("accountType")
      .isIn(["student", "organizer"])
      .withMessage("Invalid account type"),
    body("firstName").notEmpty().trim().escape(),
    body("lastName").notEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, accountType, firstName, lastName } = req.body;

      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
        });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("users")
        .insert([
          {
            id: authUser.user.id,
            email,
            account_type: accountType,
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (profileError) {
        return res.status(400).json({ error: profileError.message });
      }

      res.status(201).json({
        message: "User registered successfully. Please log in.",
        user: profile[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Login - Admin only
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("users")
        .select("id, email, name, role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        return res.status(401).json({ error: "User profile not found" });
      }

      if (profile.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }

      res.cookie(COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);

      res.json({
        message: "Login successful",
        user: profile,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Me - validate session from cookie
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return res.status(401).json({ error: "Session expired" });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (token) {
      // Invalidate the session in Supabase using the token
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ message: "Logout successful" });
  }
});

export default router;
