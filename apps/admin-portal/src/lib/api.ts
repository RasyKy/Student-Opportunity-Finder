// ─── API Layer ────────────────────────────────────────────────────────
// Replace these functions with real fetch/axios calls when backend is ready.
// Keep the function signatures and return types the same.

import {
  dashboardStats,
  chartData,
  contentItems,
  userAccounts,
  type DashboardStats,
  type ChartDataPoint,
  type ContentItem,
  type UserAccount,
  type AuthUser,
} from "./mock-data";
import { supabase } from "./supabase";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Auth ────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  _password: string,
  role: "admin" | "organizer",
): Promise<AuthUser> {
  await delay(400);
  // TODO: Replace with POST /api/auth/login
  if (!email || !_password) throw new Error("Email and password are required");
  return {
    id: "1",
    name: role === "admin" ? "Admin User" : "Organizer User",
    email,
    role,
  };
}

export async function signupUser(
  name: string,
  email: string,
  _password: string,
  role: "admin" | "organizer",
): Promise<AuthUser> {
  await delay(400);
  // TODO: Replace with POST /api/auth/signup
  if (!name || !email || !_password) throw new Error("All fields are required");
  return { id: "2", name, email, role };
}

// ─── Dashboard ───────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(200);
  // TODO: Replace with GET /api/dashboard/stats
  return dashboardStats;
}

export async function fetchChartData(
  _period: "3months" | "30days" | "7days" = "3months",
): Promise<ChartDataPoint[]> {
  await delay(200);
  // TODO: Replace with GET /api/dashboard/chart?period=...
  if (_period === "7days") return chartData.slice(-2);
  if (_period === "30days") return chartData.slice(-4);
  return chartData;
}

// ─── Content Management ──────────────────────────────────────────────

export async function fetchContentItems(): Promise<ContentItem[]> {
  const { data, error } = await supabase.from("opportunities").select(`
  id, title, title_kh, organization, type, status,
  source_platform, source_name, created_at, subject_tags,
  start_date, deadline, description, description_kh,
  location, application_link, is_free, image_url,
  language, eligibility, target_group, format, contact_info
`);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: row.title ?? "",
    title_kh: row.title_kh ?? "",
    organization: row.organization ?? "",
    type: row.type as ContentItem["type"],
    status: (row.status === "pending_review"
      ? "pending"
      : row.status) as ContentItem["status"],
    source: "scraped" as ContentItem["source"],
    flagged: false,
    createdAt: row.created_at ?? "",
    subjectTags: row.subject_tags ?? [],
    startDate: row.start_date ?? "",
    deadline: row.deadline ?? "",
    description: row.description ?? "",
    description_kh: row.description_kh ?? "",
    location: row.location ?? "",
    application_link: row.application_link ?? "",
    is_free: row.is_free ?? false,
    image_url: row.image_url ?? "",
    language: row.language ?? "",
    source_name: row.source_name ?? "",
    source_platform: row.source_platform ?? "",
    eligibility: row.eligibility ?? "",
    target_group: row.target_group ?? [],
    format: row.format ?? "",
    contact_info: row.contact_info ?? "",
  }));
}

export async function updateContentStatus(
  id: string,
  status: ContentItem["status"],
): Promise<ContentItem> {
  await delay(300);
  // TODO: Replace with PATCH /api/content/:id/status
  const item = contentItems.find((c) => c.id === id);
  if (!item) throw new Error("Content not found");
  return { ...item, status };
}

export async function deleteContent(id: string): Promise<void> {
  await delay(300);
  // TODO: Replace with DELETE /api/content/:id
  const idx = contentItems.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Content not found");
}

// ─── Account Management ──────────────────────────────────────────────

export async function fetchUserAccounts(): Promise<UserAccount[]> {
  await delay(200);
  // TODO: Replace with GET /api/users
  return userAccounts;
}

export async function updateUserStatus(
  id: string,
  status: UserAccount["status"],
): Promise<UserAccount> {
  await delay(300);
  // TODO: Replace with PATCH /api/users/:id
  const user = userAccounts.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return { ...user, status };
}
