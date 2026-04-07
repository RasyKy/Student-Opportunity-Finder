import { supabase, supabaseAdmin } from "../config/database.js";

const COOKIE_NAME = "sof_admin_token";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: "User profile not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
    };

    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: "Authentication failed", details: error.message });
  }
};

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
