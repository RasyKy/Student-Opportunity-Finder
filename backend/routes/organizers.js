import express from "express";
import { body, validationResult } from "express-validator";
import { supabaseAdmin } from "../config/database.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// POST /organizers/register — public, no auth required
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("name").notEmpty().trim().escape(),
    body("org_name").notEmpty().trim().escape(),
        body("website_url").isURL().withMessage("Enter a valid website URL"),
        body("official_email").isEmail().withMessage("Enter a valid email address"),
        body("category").notEmpty().withMessage("Organization category is required"),
    body("social_link")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Enter a valid social link URL"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

        const {
      email,
      password,
      name,
      org_name,
      website_url,
      official_email,
      social_link,
      category,
    } = req.body;

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
        });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      const userId = authData.user.id;

      // 2. Insert into public.users (upsert in case trigger already fired)
      const { error: userError } = await supabaseAdmin.from("users").upsert({
        id: userId,
        email,
        name,
        role: "student",
        created_at: new Date().toISOString(),
      });

      if (userError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(400).json({ error: userError.message });
      }

      // 3. Insert into organizer_profiles
            const { error: profileError } = await supabaseAdmin
        .from("organizer_profiles")
        .insert({
          user_id: userId,
          org_name,
          website_url,
          official_email,
          social_link: social_link || null,
          category,
          verification_status: "pending",
        });

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return res.status(400).json({ error: profileError.message });
      }

      res
        .status(201)
        .json({
          message: "Registration submitted. Your account is pending review.",
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// GET /organizers — get all organizer profiles (admin only)
router.get("/", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("organizer_profiles")
            .select(
        `
        id,
        user_id,
        org_name,
        website_url,
        official_email,
        social_link,
        category,
        verification_status,
        flagged,
        rejection_reason,
        created_at,
        users (
          email,
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Map DB columns to frontend expected format
    const mapped = (data ?? []).map((row) => ({
      ...row,
      brand_name: row.org_name,
      contact_email: row.official_email,
      org_type: row.category,
      status: row.verification_status,
      flagged_reason: row.rejection_reason,
      post_count: 0,
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /organizers/:id/status — approve or reject an organizer (admin only)
// body: { status: 'verified' | 'suspended' | 'pending' }
router.patch(
  "/:id/status",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["verified", "suspended", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }

            const { data, error } = await supabaseAdmin
        .from("organizer_profiles")
        .update({ verification_status: status })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: "Organizer not found" });
      }

      // Flip users.role based on status
      const roleMap = {
        verified: "organizer",
        suspended: "student",
        pending: "student",
      };

      await supabaseAdmin
        .from("users")
        .update({ role: roleMap[status] })
        .eq("id", data.user_id);

      res.json({
        ...data,
        brand_name: data.org_name,
        contact_email: data.official_email,
        org_type: data.category,
        status: data.verification_status,
        flagged_reason: data.rejection_reason,
        post_count: 0,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// PATCH /organizers/:id/flag — flag or unflag an organizer (admin only)
// body: { flagged: boolean, flagged_reason?: string }
router.patch(
  "/:id/flag",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { flagged, flagged_reason } = req.body;

      if (typeof flagged !== "boolean") {
        return res.status(400).json({ error: "flagged must be a boolean" });
      }

            const { data, error } = await supabaseAdmin
        .from("organizer_profiles")
        .update({
          flagged,
          rejection_reason: flagged ? (flagged_reason ?? null) : null,
        })
        .eq("id", req.params.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: "Organizer not found" });
      }

      res.json({
        ...data,
        brand_name: data.org_name,
        contact_email: data.official_email,
        org_type: data.category,
        status: data.verification_status,
        flagged_reason: data.rejection_reason,
        post_count: 0,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
