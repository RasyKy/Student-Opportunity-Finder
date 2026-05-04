"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  X,
} from "lucide-react";
import { fetchUserAccounts, updateUserStatus } from "@/lib/api";
import type { UserAccount } from "@/lib/mock-data";

const statusColors: Record<UserAccount["status"], string> = {
  verified: "bg-[#AFF4C6] text-gray-900",
  pending: "bg-[#FFE8A3] text-gray-900",
  suspended: "bg-[#D4183D] text-white",
};

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | UserAccount["status"]
  >("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(
    null,
  );

  useEffect(() => {
    fetchUserAccounts()
      .then((data) => setAccounts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const query = search.toLowerCase();
      const matchSearch =
        a.brand_name.toLowerCase().includes(query) ||
        a.contact_email.toLowerCase().includes(query) ||
        a.org_type.toLowerCase().includes(query);
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [accounts, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const pendingCount = useMemo(
    () => accounts.filter((a) => a.status === "pending").length,
    [accounts],
  );

  const flaggedCount = useMemo(
    () => accounts.filter((a) => a.flagged).length,
    [accounts],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, rowsPerPage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedAccount(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const updateSelectedAccountStatus = async (
    nextStatus: UserAccount["status"],
  ) => {
    if (!selectedAccount) return;
    try {
      await updateUserStatus(selectedAccount.id, nextStatus);
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === selectedAccount.id ? { ...a, status: nextStatus } : a,
        ),
      );
      setSelectedAccount((prev) =>
        prev ? { ...prev, status: nextStatus } : prev,
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <Users className="mr-2 h-4 w-4 text-gray-500" />
        <h1 className="text-sm font-semibold text-gray-900">
          Account Management
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-5 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
            <span className="font-medium">Organizers</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold text-gray-700">
              {accounts.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <CircleAlert className="h-3.5 w-3.5 text-[#D18D00]" />
              <span>{pendingCount} pending verifications</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
              <CircleAlert className="h-3.5 w-3.5 text-[#D23030]" />
              <span>{flaggedCount} flagged account</span>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[16rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          </div>
        ) : error ? (
          <div className="flex justify-center py-10 text-sm text-red-500">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Brand Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Contact Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Posts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Org Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((account) => (
                  <tr
                    key={account.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50/70"
                    onClick={() => setSelectedAccount(account)}
                  >
                    <td className="px-4 py-2.5 text-sm text-gray-900">
                      {account.brand_name}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">
                      {account.contact_email}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">
                      {account.post_count}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">
                      {account.org_type}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">
                      {formatDate(account.created_at)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[account.status]}`}
                      >
                        {account.status.charAt(0).toUpperCase() +
                          account.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No organizer accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-600">
                0 of {filtered.length} row(s) selected.
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Rows per page</span>
                  <div className="relative">
                    <select
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="appearance-none rounded-md border border-gray-200 bg-white py-1 pl-2 pr-7 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setSelectedAccount(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Organizer verification details"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid gap-5 border-b border-gray-200 p-4 md:grid-cols-2 md:p-5">
              <section>
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:text-sm">
                    ORGANIZATION DETAILS
                  </h2>
                </div>
                <p className="text-xl font-semibold leading-tight text-gray-900 md:text-2xl">
                  {selectedAccount.brand_name}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      WEBSITE
                    </h3>
                    <a
                      href={selectedAccount.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-base font-medium text-violet-600 hover:underline md:text-lg"
                    >
                      {selectedAccount.website_url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      CONTACT EMAIL
                    </h3>
                    <p className="mt-1 break-all text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedAccount.contact_email}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      ORG TYPE
                    </h3>
                    <p className="mt-1 text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedAccount.org_type}
                    </p>
                  </div>

                  {selectedAccount.social_link && (
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                        SOCIAL LINK
                      </h3>
                      <a
                        href={selectedAccount.social_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-base font-medium text-violet-600 hover:underline md:text-lg"
                      >
                        {selectedAccount.social_link}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      ACCOUNT EMAIL
                    </h3>
                    <p className="mt-1 break-all text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedAccount.users?.email ?? "-"}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:text-sm">
                    ACCOUNT INFO
                  </h2>
                  <button
                    type="button"
                    className="-mt-1 -mr-1 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    onClick={() => setSelectedAccount(null)}
                    aria-label="Close verification popup"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      NAME
                    </h3>
                    <p className="mt-1 text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedAccount.users?.name ?? "-"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      STATUS
                    </h3>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[selectedAccount.status]}`}
                    >
                      {selectedAccount.status.charAt(0).toUpperCase() +
                        selectedAccount.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      SUBMITTED
                    </h3>
                    <p className="mt-1 text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {formatDate(selectedAccount.created_at)}
                    </p>
                  </div>

                  {selectedAccount.flagged &&
                    selectedAccount.flagged_reason && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-red-500 md:text-sm">
                          FLAG REASON
                        </h3>
                        <p className="mt-1 text-base font-medium leading-tight text-red-600 md:text-lg">
                          {selectedAccount.flagged_reason}
                        </p>
                      </div>
                    )}
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between p-4 md:p-5">
              <button
                type="button"
                className="rounded-lg bg-[#04A357] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#03914D]"
                onClick={() => updateSelectedAccountStatus("verified")}
              >
                Approve &amp; Notify
              </button>

              <button
                type="button"
                className="rounded-lg bg-[#D4183D] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#BF1537]"
                onClick={() => updateSelectedAccountStatus("suspended")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
