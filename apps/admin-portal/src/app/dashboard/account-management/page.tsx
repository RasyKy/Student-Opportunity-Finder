"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  ExternalLink,
  X,
} from "lucide-react";
import { fetchUserAccounts } from "@/lib/api";
import type { UserAccount } from "@/lib/mock-data";

const statusColors: Record<UserAccount["status"], string> = {
  verified: "bg-[#AFF4C6] text-gray-900",
  pending: "bg-[#FFE8A3] text-gray-900",
  suspended: "bg-[#D4183D] text-white ",
};

const accountModalDetails: Record<
  string,
  {
    website: string;
    contactName: string;
    contactEmail: string;
    documentName: string;
  }
> = {
  "1": {
    website: "kit.edu.kh",
    contactName: "John Doe",
    contactEmail: "john@kit.edu.kh",
    documentName: "KIT-verify.pdf",
  },
  "2": {
    website: "website.com/asdf",
    contactName: "Jane Smith",
    contactEmail: "jane@website.com",
    documentName: "website-verification.pdf",
  },
  "3": {
    website: "climatehub.org",
    contactName: "Sam Lee",
    contactEmail: "sam@climatehub.org",
    documentName: "climate-registration.pdf",
  },
  "4": {
    website: "socialimpact.org",
    contactName: "Alex Kim",
    contactEmail: "alex@socialimpact.org",
    documentName: "social-license.pdf",
  },
  "5": {
    website: "techskills.io",
    contactName: "Chris Tan",
    contactEmail: "chris@techskills.io",
    documentName: "techskills-verification.pdf",
  },
};

export default function AccountManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | UserAccount["status"]>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    fetchUserAccounts().then((data) => {
      setAccounts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const query = search.toLowerCase();
      const matchSearch =
        a.brandName.toLowerCase().includes(query) ||
        a.contact.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query);
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
    () => accounts.filter((account) => account.status === "pending").length,
    [accounts]
  );

  const flaggedCount = useMemo(
    () => accounts.filter((account) => account.flagged).length,
    [accounts]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, rowsPerPage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedAccount(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedDetails = selectedAccount ? accountModalDetails[selectedAccount.id] : null;

  const updateSelectedAccountStatus = (nextStatus: UserAccount["status"]) => {
    if (!selectedAccount) return;

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === selectedAccount.id ? { ...account, status: nextStatus } : account
      )
    );
    setSelectedAccount((prev) => (prev ? { ...prev, status: nextStatus } : prev));
  };

  const displayedOrganizersCount = 15;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <Users className="mr-2 h-4 w-4 text-gray-500" />
        <h1 className="text-sm font-semibold text-gray-900">Account Management</h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-5 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
            <span className="font-medium">Organizers</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-100 px-1.5 text-xs font-semibold text-gray-700">
              {displayedOrganizersCount}
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
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
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
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Brand Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Post
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Document
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
                    <td className="px-4 py-2.5 text-sm text-gray-900">{account.brandName}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{account.contact}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{account.postCount}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{account.category}</td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">
                      {account.documentStatus === "submitted" ? "Submitted" : "No Document"}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-700">{account.submittedAt}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[account.status]}`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">
                      No organizer accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-600">0 of {filtered.length} row(s) selected.</p>

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

                <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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

      {selectedAccount && selectedDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          onClick={() => setSelectedAccount(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Organizer verification details"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="grid gap-5 border-b border-gray-200 p-4 md:grid-cols-2 md:p-5">
              <section>
                <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 md:text-sm">
                  ORGANIZATION DETAILS
                </h2>
                <p className="text-xl font-semibold leading-tight text-gray-900 md:text-2xl">
                  {selectedAccount.brandName}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      WEBSITE
                    </h3>
                    <p className="mt-1 text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedDetails.website}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      CONTACT NAME
                    </h3>
                    <p className="mt-1 text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedDetails.contactName}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                      CONTACT EMAIL
                    </h3>
                    <p className="mt-1 break-all text-base font-medium leading-tight text-gray-900 md:text-lg">
                      {selectedDetails.contactEmail}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 md:text-sm">
                    PROOF OF ASSOCIATION
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

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  <div className="flex h-40 flex-col items-center justify-center gap-2.5 px-4 text-center text-gray-500 md:h-52">
                    <FileText className="h-10 w-10" />
                    <p className="text-sm font-medium md:text-base">{selectedDetails.documentName}</p>
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in New Tab
                    </button>
                  </div>
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
