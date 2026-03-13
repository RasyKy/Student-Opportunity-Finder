"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

const navItems: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Content Management", href: "/dashboard/content-management", icon: FileText },
  { title: "Account Management", href: "/dashboard/account-management", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-60 flex-col bg-violet-100/80">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-violet-200/60 px-4 py-5">
        <img src="/logo.svg" alt="SOF" className="h-8 w-8 rounded-lg" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">SOF</p>
          <p className="text-xs text-gray-500">Admin</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white font-medium text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-violet-200/60 px-3 py-4">
        {user && (
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
