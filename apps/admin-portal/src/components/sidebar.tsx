"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

const navItems: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Content Management",
    href: "/dashboard/content-management",
    icon: FileText,
  },
  {
    title: "Account Management",
    href: "/dashboard/account-management",
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-violet-100/80 transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-violet-200/60 px-4 py-5 ${collapsed ? "justify-center" : "gap-2"}`}
      >
        {!collapsed && (
          <>
            <img src="/logo.svg" alt="SOF" className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">SOF</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-white/50 hover:text-gray-600 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/50 hover:text-gray-600 transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${collapsed ? "justify-center" : "gap-2.5"} ${
                isActive
                  ? "bg-white font-medium text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-900"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-violet-200/60 px-3 py-4">
        {user && !collapsed && (
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Log Out" : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-white/50 hover:text-gray-900 ${collapsed ? "justify-center" : "gap-2.5"}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Log Out"}
        </button>
      </div>
    </aside>
  );
}
