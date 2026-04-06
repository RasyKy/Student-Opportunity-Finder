// Auth functions for apps/admin-portal/src/lib/api.ts
// Replace the existing loginUser / logoutUser mock functions with these.
// All requests use credentials: "include" so the httpOnly cookie is sent automatically.

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data.user;
}

export async function logoutUser() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Not authenticated");

  const data = await res.json();
  return data.user;
}
