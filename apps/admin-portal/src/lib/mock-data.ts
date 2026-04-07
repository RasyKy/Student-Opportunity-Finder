// ─── Types ───────────────────────────────────────────────────────────
// These types mirror expected backend API responses.
// When connecting to a real backend, keep these types and update api.ts.

export type DashboardStats = {
  totalActivePosts: StatItem;
  pendingOrganizerRequests: StatItem;
  pendingContentApproval: StatItem;
};

export type StatItem = {
  value: number;
  changePercent: number;
  trend: string;
  note: string;
};

export type ChartDataPoint = {
  month: string;
  courses: number;
  events: number;
  scholarships: number;
};

export type ContentItem = {
  id: string;
  title: string;
  title_kh: string;
  organization: string;
  type: "course" | "event" | "scholarship" | "internship" | "job";
  status: "published" | "pending" | "private";
  source: "scraped" | "organizer" | "internal";
  flagged: boolean;
  createdAt: string;
  subjectTags: string[];
  startDate: string;
  deadline: string;
  description: string;
  description_kh: string;
  location: string;
  application_link: string;
  is_free: boolean;
  image_url: string;
  language: string;
  source_name: string;
  source_platform: string;
  eligibility: string;
  target_group: string[];
  format: "online" | "onsite" | "hybrid" | "unknown" | "";
  contact_info: string;
};

export type UserAccount = {
  id: string;
  brand_name: string;
  contact_email: string;
  org_type: string;
  website_url: string;
  social_link: string | null;
  post_count: number;
  status: "verified" | "pending" | "suspended";
  flagged: boolean;
  flagged_reason: string | null;
  created_at: string;
  users: {
    email: string;
    name: string;
  } | null;
};

// ─── Mock Data ───────────────────────────────────────────────────────

export const dashboardStats: DashboardStats = {
  totalActivePosts: {
    value: 50,
    changePercent: 12.5,
    trend: "Trending up this month",
    note: "+12% from last month",
  },
  pendingOrganizerRequests: {
    value: 32,
    changePercent: -20,
    trend: "Down 20% this period",
    note: "Acquisition needs attention",
  },
  pendingContentApproval: {
    value: 100,
    changePercent: 12.5,
    trend: "Strong user retention",
    note: "Engagement exceed targets",
  },
};

export const chartData: ChartDataPoint[] = [
  { month: "Jan", courses: 11, events: 8, scholarships: 5 },
  { month: "Feb", courses: 14, events: 10, scholarships: 7 },
  { month: "Mar", courses: 10, events: 14, scholarships: 4 },
  { month: "Apr", courses: 16, events: 9, scholarships: 9 },
  { month: "May", courses: 21, events: 11, scholarships: 6 },
  { month: "Jun", courses: 15, events: 14, scholarships: 11 },
  { month: "Jul", courses: 18, events: 14, scholarships: 14 },
  { month: "Aug", courses: 25, events: 14, scholarships: 11 },
];

export const contentItems: ContentItem[] = [];

export const userAccounts: UserAccount[] = [];

// ─── Mock Credentials ────────────────────────────────────────────────

export const mockCredentials = {
  admin: { email: "admin@sof.com", password: "admin123" },
  organizer: { email: "organizer@sof.com", password: "org123" },
};
