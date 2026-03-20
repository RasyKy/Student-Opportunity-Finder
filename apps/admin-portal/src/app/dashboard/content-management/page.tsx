"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  FileText,
  Search,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { fetchContentItems } from "@/lib/api";
import type { ContentItem } from "@/lib/mock-data";
import EditPostPanel from "@/components/edit-post-panel";

const statusStyles: Record<ContentItem["status"], string> = {
  published: "bg-[#AFF4C6] text-black-700",
  pending: "bg-[#FFE8A3] text-black-700",
  private: "bg-white ring-1 ring-gray-300 text-black-600",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Check if a post has potential duplicates among other items */
function checkDuplicate(item: ContentItem, allItems: ContentItem[]): boolean {
  return allItems.some(
    (other) =>
      other.id !== item.id &&
      other.title.toLowerCase() === item.title.toLowerCase() &&
      other.organization.toLowerCase() === item.organization.toLowerCase() &&
      other.type === item.type
  );
}

// ─── Toast ──────────────────────────────────────────────────────────
function Toast({
  message,
  description,
  onDismiss,
}: {
  message: string;
  description: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg max-w-sm animate-[slideUp_0.3s_ease-out]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Dismiss
      </button>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────
export default function ContentManagementPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ContentItem["status"]>("all");
  const [filterSource, setFilterSource] = useState<"all" | ContentItem["source"]>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostOrganization, setNewPostOrganization] = useState("");
  const [newPostSubjectTags, setNewPostSubjectTags] = useState("");
  const [newPostStart, setNewPostStart] = useState("");
  const [newPostDeadline, setNewPostDeadline] = useState("");
  const [newPostType, setNewPostType] = useState<"" | ContentItem["type"]>("");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [isNewPostPrivate, setIsNewPostPrivate] = useState(true);

  // Edit panel
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; description: string } | null>(null);

  useEffect(() => {
    fetchContentItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  // Pre-compute duplicates
  const duplicateIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of items) {
      if (checkDuplicate(item, items)) ids.add(item.id);
    }
    return ids;
  }, [items]);

  const isDuplicate = selectedItem ? selectedItem.flagged && duplicateIds.has(selectedItem.id) : false;

  // Toast when opening a duplicate
  useEffect(() => {
    if (isDuplicate && selectedItem) {
      setToast({ message: "Possible Duplicate", description: "Your preferences have been updated" });
    }
  }, [isDuplicate, selectedItem?.id]);

  const stats = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === "pending").length;
    const flagged = items.filter((i) => i.flagged).length;
    return { total, pending, flagged };
  }, [items]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterSource, rowsPerPage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.organization.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchSource = filterSource === "all" || item.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginatedItems = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handlers
  const handleRowClick = useCallback((id: string) => {
    setSelectedItemId(id);
    setIsFullscreen(false);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedItemId(null);
    setIsFullscreen(false);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleSave = useCallback((updated: ContentItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedItemId === id) {
        setSelectedItemId(null);
        setIsFullscreen(false);
      }
    },
    [selectedItemId]
  );

  const handleToggleStatus = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next: ContentItem["status"] =
          item.status === "published" ? "pending" : item.status === "pending" ? "private" : "published";
        return { ...item, status: next };
      })
    );
  }, []);

  const handleDismissToast = useCallback(() => setToast(null), []);

  const resetCreateForm = useCallback(() => {
    setNewPostTitle("");
    setNewPostOrganization("");
    setNewPostSubjectTags("");
    setNewPostStart("");
    setNewPostDeadline("");
    setNewPostType("");
    setNewPostDescription("");
    setIsNewPostPrivate(true);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  }, [resetCreateForm]);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleDeleteDraft = useCallback(() => {
    resetCreateForm();
    setIsCreateModalOpen(false);
  }, [resetCreateForm]);

  const handleCreatePost = useCallback(() => {
    if (!newPostTitle.trim() || !newPostOrganization.trim() || !newPostType) {
      setToast({
        message: "Missing required fields",
        description: "Please enter title, organisation, and type before saving.",
      });
      return;
    }

    const nextId = String(
      Math.max(0, ...items.map((item) => Number.parseInt(item.id, 10)).filter((n) => !Number.isNaN(n))) + 1
    );

    const tags = newPostSubjectTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const created: ContentItem = {
      id: nextId,
      title: newPostTitle.trim(),
      organization: newPostOrganization.trim(),
      type: newPostType,
      status: isNewPostPrivate ? "private" : "pending",
      source: "internal",
      flagged: false,
      createdAt: new Date().toISOString(),
      subjectTags: tags,
      startDate: newPostStart || "",
      deadline: newPostDeadline || "",
      description: newPostDescription.trim(),
    };

    setItems((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
    setToast({ message: "Post created", description: "The new opportunity has been added." });
  }, [
    isNewPostPrivate,
    items,
    newPostDeadline,
    newPostDescription,
    newPostOrganization,
    newPostStart,
    newPostSubjectTags,
    newPostTitle,
    newPostType,
  ]);

  const showList = !isFullscreen;
  const showPanel = selectedItem !== null;

  return (
    <>
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center border-b border-gray-200 bg-white px-6">
        <FileText className="mr-2 h-4 w-4 text-gray-500" />
        <h1 className="text-sm font-semibold text-gray-900">Content Management</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left: Table list ─────────────────────────────────── */}
        {showList && (
          <div className={`overflow-y-auto p-6 ${showPanel ? "w-[55%] border-r border-gray-200" : "flex-1"}`}>
            {/* Summary bar + New Post */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-5 bg-gray-400/10 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-700">
                  Total Posts{" "}
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-lg bg-white px-1.5 text-xs font-semibold text-gray-700 py-0.5">
                    {stats.total}
                  </span>
                </span>
                <span className="text-sm text-gray-700">
                  Pending Review{" "}
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-lg bg-[#FFE8A3] px-1.5 text-xs font-semibold text-black-700">
                    {stats.pending}
                  </span>
                </span>
                <span className="text-sm text-gray-700">
                  Flagged{" "}
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-lg bg-[#FCB3AD] px-1.5 text-xs font-semibold text-black-600">
                    {stats.flagged}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                New Post
              </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-5 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="private">Private</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as typeof filterSource)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">All Sources</option>
                  <option value="scraped">Scraped</option>
                  <option value="organizer">Organizer</option>
                  <option value="internal">Internal</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option>All Time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Title / Org
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="w-10 px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item.id)}
                        className={`cursor-pointer hover:bg-gray-50/50 ${selectedItemId === item.id ? "bg-violet-50/60" : ""}`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.organization.length > 15
                              ? item.organization.substring(0, 15) + "..."
                              : item.organization}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[item.status]}`}
                          >
                            {item.status === "published"
                              ? "Published"
                              : item.status === "pending"
                                ? "Pending"
                                : "Private"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          {item.flagged && duplicateIds.has(item.id) && (
                            <AlertTriangle className="inline-block h-4 w-4 text-rose-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500">
                          No posts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                  <p className="text-sm text-gray-500">
                    {selectedRows.size} of {filtered.length} row(s) selected.
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Right: Edit Post Panel ───────────────────────────── */}
        {showPanel && selectedItem && (
          <div className={`${isFullscreen ? "flex-1" : "w-[45%]"} overflow-hidden border-l border-gray-200`}>
            <EditPostPanel
              item={selectedItem}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              onClose={handleClosePanel}
              onSave={handleSave}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              isDuplicate={isDuplicate}
            />
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} description={toast.description} onDismiss={handleDismissToast} />}

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3"
          onClick={handleCloseCreateModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create new post"
            className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-5 pt-5">
              <div>
                <h2 className="text-2xl font-semibold leading-tight text-gray-900">Create New Post</h2>
                <p className="mt-1 text-sm text-gray-500">Fill in the details to create a new opportunity post.</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                aria-label="Close new post modal"
                className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 px-5 pb-5 pt-4 md:gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(event) => setNewPostTitle(event.target.value)}
                  placeholder="Enter post title"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Organisation
                  </label>
                  <input
                    type="text"
                    value={newPostOrganization}
                    onChange={(event) => setNewPostOrganization(event.target.value)}
                    placeholder="Enter organisation"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Subject Tags
                  </label>
                  <input
                    type="text"
                    value={newPostSubjectTags}
                    onChange={(event) => setNewPostSubjectTags(event.target.value)}
                    placeholder="Comma separated tags"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Start
                  </label>
                  <input
                    type="date"
                    value={newPostStart}
                    onChange={(event) => setNewPostStart(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={newPostType}
                      onChange={(event) => setNewPostType(event.target.value as "" | ContentItem["type"])}
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select type</option>
                      <option value="course">Course</option>
                      <option value="event">Event</option>
                      <option value="scholarship">Scholarship</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="max-w-[49.5%]">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Deadline
                </label>
                <input
                  type="date"
                  value={newPostDeadline}
                  onChange={(event) => setNewPostDeadline(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </label>
                <textarea
                  value={newPostDescription}
                  onChange={(event) => setNewPostDescription(event.target.value)}
                  rows={5}
                  placeholder="Enter post description"
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreatePost}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewPostPrivate((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {isNewPostPrivate ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  {isNewPostPrivate ? "Private" : "Pending"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDeleteDraft}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
