// ─── API Layer ────────────────────────────────────────────────────────
import {
  dashboardStats,
  chartData,
  userAccounts,
  type DashboardStats,
  type ChartDataPoint,
  type ContentItem,
  type UserAccount,
} from "./mock-data";
import { supabase } from "./supabase";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Auth ────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data.user;
}

export async function logoutUser() {
  await fetch(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe() {
  const res = await fetch(`/api/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  const data = await res.json();
  return data.user;
}

// ─── Dashboard ───────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(200);
  return dashboardStats;
}

export async function fetchChartData(
  _period: "3months" | "30days" | "7days" = "3months",
): Promise<ChartDataPoint[]> {
  await delay(200);
  if (_period === "7days") return chartData.slice(-2);
  if (_period === "30days") return chartData.slice(-4);
  return chartData;
}

// ─── Content Management ──────────────────────────────────────────────

export async function fetchContentItems(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select(
      `
  id, title, title_kh, organization, type, status,
  source_platform, source_name, created_at, subject_tags,
  start_date, deadline, description, description_kh,
  location, application_link, is_free, image_url,
  language, eligibility, target_group, format, contact_info
`,
    )
    .neq("status", "deleted");

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

export async function createContent(item: ContentItem): Promise<ContentItem> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      title: item.title,
      title_kh: item.title_kh,
      organization: item.organization,
      type: item.type,
      status: "pending_review",
      subject_tags: item.subjectTags,
      start_date: parseDate(item.startDate),
      deadline: parseDate(item.deadline),
      description: item.description,
      description_kh: item.description_kh,
      location: item.location,
      application_link: item.application_link,
      is_free: item.is_free,
      image_url: item.image_url,
      language: item.language,
      source_name: item.source_name,
      source_platform: item.source_platform,
      eligibility: item.eligibility,
      target_group: item.target_group,
      format: ["online", "onsite", "hybrid", "unknown"].includes(item.format)
        ? item.format
        : "unknown",
      contact_info: item.contact_info,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...item, id: String(data.id) };
}

const parseDate = (dateStr: string) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export async function updateContent(item: ContentItem): Promise<ContentItem> {
  const dbStatus = item.status === "pending" ? "pending_review" : item.status;
  const { error } = await supabase
    .from("opportunities")
    .update({
      title: item.title,
      title_kh: item.title_kh,
      organization: item.organization,
      type: item.type,
      status: dbStatus,
      subject_tags: item.subjectTags,
      start_date: parseDate(item.startDate),
      deadline: parseDate(item.deadline),
      description: item.description,
      description_kh: item.description_kh,
      location: item.location,
      application_link: item.application_link,
      is_free: item.is_free,
      image_url: item.image_url,
      language: item.language,
      source_name: item.source_name,
      source_platform: item.source_platform,
      eligibility: item.eligibility,
      target_group: item.target_group,
      format: ["online", "onsite", "hybrid", "unknown"].includes(item.format)
        ? item.format
        : "unknown",
      contact_info: item.contact_info,
    })
    .eq("id", item.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { ...item, status: item.status };
}

export async function updateContentStatus(
  id: string,
  status: ContentItem["status"],
): Promise<ContentItem> {
  const dbStatus = status === "pending" ? "pending_review" : status;
  const { data, error } = await supabase
    .from("opportunities")
    .update({ status: dbStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    id: String(data.id),
    status,
    source: "scraped" as ContentItem["source"],
    flagged: false,
    createdAt: data.created_at ?? "",
    subjectTags: data.subject_tags ?? [],
    startDate: data.start_date ?? "",
    deadline: data.deadline ?? "",
    title_kh: data.title_kh ?? "",
    description_kh: data.description_kh ?? "",
    location: data.location ?? "",
    application_link: data.application_link ?? "",
    is_free: data.is_free ?? false,
    image_url: data.image_url ?? "",
    language: data.language ?? "",
    source_name: data.source_name ?? "",
    source_platform: data.source_platform ?? "",
    eligibility: data.eligibility ?? "",
    target_group: data.target_group ?? [],
    format: data.format ?? "",
    contact_info: data.contact_info ?? "",
  };
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase
    .from("opportunities")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// ─── Account Management ──────────────────────────────────────────────

export async function fetchUserAccounts(): Promise<UserAccount[]> {
  const res = await fetch(`/api/organizers`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch organizer accounts");
  return res.json();
}

export async function updateUserStatus(
  id: string,
  status: UserAccount["status"],
): Promise<void> {
  const res = await fetch(`/api/organizers/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update status");
  }
}

export async function updateUserFlag(
  id: string,
  flagged: boolean,
  flagged_reason?: string,
): Promise<void> {
  const res = await fetch(`/api/organizers/${id}/flag`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ flagged, flagged_reason }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update flag");
  }
}
