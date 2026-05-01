"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loginUser, signupUser } from "@/lib/api";
import type { AuthUser } from "@/lib/mock-data";

const STORAGE_KEY = "sof-admin-user";
const ORGANIZER_PORTAL_URL =
  process.env.NEXT_PUBLIC_ORGANIZER_PORTAL_URL ?? "http://localhost:3001";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: "admin" | "organizer") => Promise<void>;
  signup: (name: string, email: string, password: string, role: "admin" | "organizer") => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, role: "admin" | "organizer") => {
      const u = await loginUser(email, password, role);
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      if (role === "organizer") {
        window.location.assign(ORGANIZER_PORTAL_URL);
        return;
      }

      router.push("/dashboard");
    },
    [router]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, role: "admin" | "organizer") => {
      const u = await signupUser(name, email, password, role);
      setUser(u);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      if (role === "organizer") {
        window.location.assign(ORGANIZER_PORTAL_URL);
        return;
      }

      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
