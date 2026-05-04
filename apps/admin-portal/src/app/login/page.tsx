"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="SOF" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold text-gray-900">SOF Admin</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            Login with your admin account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Admin accounts are managed by the platform team.
          </p>
        </div>
      </div>
    </div>
  );
}
