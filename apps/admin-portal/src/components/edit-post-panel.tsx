"use client";

import { useState, useCallback, useMemo } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  AlertTriangle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type { ContentItem } from "@/lib/mock-data";

type EditPostPanelProps = {
  item: ContentItem;
  isFullscreen: boolean;
  isNew?: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onSave: (updated: ContentItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (
    id: string,
    nextStatus: ContentItem["status"],
  ) => Promise<void>;
  isDuplicate: boolean;
};

type ConfirmAction = "save" | "status" | "delete-1" | "delete-2" | "close";

const typeOptions = [
  "Course",
  "Event",
  "Scholarship",
  "Internship",
  "Job",
] as const;

const STATUS_LABEL: Record<ContentItem["status"], string> = {
  published: "Published",
  pending: "Pending",
  private: "Private",
};

const STATUS_COLOR: Record<ContentItem["status"], string> = {
  published: "bg-[#AFF4C6] text-gray-800",
  pending: "bg-[#FFE8A3] text-gray-800",
  private: "bg-white ring-1 ring-gray-300 text-gray-700",
};

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

function formatDateForAPI(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  if (!day || !month || !year) return dateStr;
  return `${year}-${month}-${day}`;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        className={`mb-1.5 block text-xs font-semibold uppercase tracking-wide ${error ? "text-red-500" : "text-gray-500"}`}
      >
        {label}
        {error && (
          <span className="ml-1.5 normal-case font-normal">— {error}</span>
        )}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 ${error ? "border-red-400 ring-1 ring-red-300 focus:ring-red-400" : "border-gray-200 focus:ring-violet-500"}`}
      />
    </div>
  );
}

function LinkField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isValidUrl = () => {
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <a
          href={isValidUrl() ? value : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!isValidUrl()}
          className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm transition-colors ${
            isValidUrl()
              ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none"
          }`}
        >
          Open
        </a>
      </div>
      {value && !isValidUrl() && (
        <p className="mt-1 text-xs text-red-400">
          Must be a valid https:// URL
        </p>
      )}
    </div>
  );
}

export default function EditPostPanel({
  item,
  isFullscreen,
  isNew,
  onToggleFullscreen,
  onClose,
  onSave,
  onDelete,
  onToggleStatus,
  isDuplicate,
}: EditPostPanelProps) {
  // Form state
  const [title, setTitle] = useState(item.title);
  const [title_kh, setTitleKh] = useState(item.title_kh);
  const [organization, setOrganization] = useState(item.organization);
  const [subjectTags, setSubjectTags] = useState<string[]>(item.subjectTags);
  const [tagInput, setTagInput] = useState("");
  const [startDate, setStartDate] = useState(
    formatDateForInput(item.startDate),
  );
  const [deadline, setDeadline] = useState(formatDateForInput(item.deadline));
  const [type, setType] = useState(item.type);
  const [description, setDescription] = useState(item.description);
  const [description_kh, setDescriptionKh] = useState(item.description_kh);
  const [location, setLocation] = useState(item.location);
  const [application_link, setApplicationLink] = useState(
    item.application_link,
  );
  const [is_free, setIsFree] = useState(item.is_free);
  const [image_url, setImageUrl] = useState(item.image_url);
  const [language, setLanguage] = useState(item.language);
  const [source_name, setSourceName] = useState(item.source_name);
  const [source_platform, setSourcePlatform] = useState(item.source_platform);
  const [eligibility, setEligibility] = useState(item.eligibility);
  const [target_group, setTargetGroup] = useState<string[]>(item.target_group);
  const [targetGroupInput, setTargetGroupInput] = useState("");
  const [format, setFormat] = useState(item.format);
  const [contact_info, setContactInfo] = useState(item.contact_info);

  // Confirmation + async state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    ContentItem["status"] | null
  >(null);
  const [titleError, setTitleError] = useState(false);

  // Unsaved changes detection
  const hasChanges = useMemo(() => {
    return (
      title !== item.title ||
      title_kh !== item.title_kh ||
      organization !== item.organization ||
      JSON.stringify(subjectTags) !== JSON.stringify(item.subjectTags) ||
      startDate !== formatDateForInput(item.startDate) ||
      deadline !== formatDateForInput(item.deadline) ||
      type !== item.type ||
      description !== item.description ||
      description_kh !== item.description_kh ||
      location !== item.location ||
      application_link !== item.application_link ||
      is_free !== item.is_free ||
      image_url !== item.image_url ||
      language !== item.language ||
      source_name !== item.source_name ||
      source_platform !== item.source_platform ||
      eligibility !== item.eligibility ||
      JSON.stringify(target_group) !== JSON.stringify(item.target_group) ||
      format !== item.format ||
      contact_info !== item.contact_info
    );
  }, [
    title,
    title_kh,
    organization,
    subjectTags,
    startDate,
    deadline,
    type,
    description,
    description_kh,
    location,
    application_link,
    is_free,
    image_url,
    language,
    source_name,
    source_platform,
    eligibility,
    target_group,
    format,
    contact_info,
    item,
  ]);

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    setLoading(true);
    try {
      await onToggleStatus(item.id, pendingStatus);
      setConfirmAction(null);
      setPendingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const buildUpdated = (): ContentItem => ({
    ...item,
    title,
    title_kh,
    organization,
    subjectTags,
    startDate: formatDateForAPI(startDate),
    deadline: formatDateForAPI(deadline),
    type,
    description,
    description_kh,
    location,
    application_link,
    is_free,
    image_url,
    language,
    source_name,
    source_platform,
    eligibility,
    target_group,
    format,
    contact_info,
  });

  const handleConfirmSave = async () => {
    if (!title.trim()) {
      setTitleError(true);
      setConfirmAction(null);
      return;
    }
    setLoading(true);
    try {
      await onSave(buildUpdated());
      setConfirmAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await onDelete(item.id);
      setConfirmAction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = () => {
    if (hasChanges) {
      setConfirmAction("close");
    } else {
      onClose();
    }
  };

  const removeTag = useCallback((index: number) => {
    setSubjectTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !subjectTags.includes(tag)) {
      setSubjectTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  }, [tagInput, subjectTags]);

  const removeTargetGroup = useCallback((index: number) => {
    setTargetGroup((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addTargetGroup = useCallback(() => {
    const val = targetGroupInput.trim();
    if (val && !target_group.includes(val)) {
      setTargetGroup((prev) => [...prev, val]);
      setTargetGroupInput("");
    }
  }, [targetGroupInput, target_group]);

  const tagInputUI = (
    tags: string[],
    onRemove: (i: number) => void,
    inputVal: string,
    onInputChange: (v: string) => void,
    onAdd: () => void,
    placeholder: string,
  ) => (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 min-h-9">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-16 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
      />
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">
            {isNew ? "New Post" : "Edit Post"}
          </h2>
          {hasChanges && !isNew && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCloseClick}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isDuplicate && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-600">
              Possible Duplicate
            </span>
          </div>
        )}

        <div className="space-y-5">
          <InputField
            label="Title"
            value={title}
            onChange={(v) => {
              setTitle(v);
              if (titleError) setTitleError(false);
            }}
            error={titleError ? "Title is required" : undefined}
          />
          <InputField
            label="Title (KH)"
            value={title_kh}
            onChange={setTitleKh}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Organisation"
              value={organization}
              onChange={setOrganization}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subject Tags
              </label>
              {tagInputUI(
                subjectTags,
                removeTag,
                tagInput,
                setTagInput,
                addTag,
                "Add tag...",
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              placeholder="DD/MM/YYYY"
            />
            <InputField
              label="Deadline"
              value={deadline}
              onChange={setDeadline}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentItem["type"])}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Format
              </label>
              <select
                value={format}
                onChange={(e) =>
                  setFormat(
                    e.target.value as
                      | "online"
                      | "onsite"
                      | "hybrid"
                      | "unknown",
                  )
                }
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="unknown">Unknown</option>
                <option value="online">Online</option>
                <option value="onsite">Onsite</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Location"
              value={location}
              onChange={setLocation}
            />
            <InputField
              label="Language"
              value={language}
              onChange={setLanguage}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Free
            </label>
            <button
              type="button"
              onClick={() => setIsFree((p) => !p)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${is_free ? "bg-violet-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${is_free ? "translate-x-4" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {is_free ? "Yes" : "No"}
            </span>
          </div>

          <InputField
            label="Eligibility"
            value={eligibility}
            onChange={setEligibility}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Target Group
            </label>
            {tagInputUI(
              target_group,
              removeTargetGroup,
              targetGroupInput,
              setTargetGroupInput,
              addTargetGroup,
              "Add group...",
            )}
          </div>

          <LinkField
            label="Application Link"
            value={application_link}
            onChange={setApplicationLink}
          />
          <LinkField
            label="Contact Info"
            value={contact_info}
            onChange={setContactInfo}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Image URL
            </label>
            <input
              type="text"
              value={image_url}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {image_url && (
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <a
                  href={image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={image_url}
                    alt="Preview"
                    className="h-40 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Source Name"
              value={source_name}
              onChange={setSourceName}
            />
            <InputField
              label="Source Platform"
              value={source_platform}
              onChange={setSourcePlatform}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 resize-none focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description (KH)
            </label>
            <textarea
              value={description_kh}
              onChange={(e) => setDescriptionKh(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 resize-none focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}

      {/* Save confirmation */}
      {confirmAction === "save" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !loading && setConfirmAction(null)}
        >
          <div
            className="w-80 rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Save changes?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This will overwrite the current saved version.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-70"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status confirmation */}
      {confirmAction === "status" && pendingStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !loading && setConfirmAction(null)}
        >
          <div
            className="w-80 rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Change status?
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">Set to</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[pendingStatus]}`}
              >
                {STATUS_LABEL[pendingStatus]}
              </span>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatus}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-70"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete — step 1 */}
      {confirmAction === "delete-1" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="w-80 rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Delete post?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("delete-2")}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete — step 2 */}
      {confirmAction === "delete-2" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !loading && setConfirmAction(null)}
        >
          <div
            className="w-80 rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <h3 className="text-base font-semibold text-gray-900">
                Are you absolutely sure?
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This post will be permanently removed and cannot be recovered.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={loading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved changes close guard */}
      {confirmAction === "close" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="w-80 rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Discard changes?
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You have unsaved changes. They will be lost if you close now.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setConfirmAction("save")}
            disabled={!hasChanges && !isNew}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          {!isNew && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span
                  className={`h-2 w-2 rounded-full ${item.status === "published" ? "bg-green-500" : item.status === "pending" ? "bg-amber-400" : "bg-gray-400"}`}
                />
                {STATUS_LABEL[item.status]}
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {statusDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setStatusDropdownOpen(false)}
                  />
                  <div className="absolute bottom-full left-0 z-20 mb-1.5 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    {(
                      [
                        "published",
                        "pending",
                        "private",
                      ] as ContentItem["status"][]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setStatusDropdownOpen(false);
                          if (s !== item.status) {
                            setPendingStatus(s);
                            setConfirmAction("status");
                          }
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${s === item.status ? "bg-gray-50 font-medium text-gray-900" : "text-gray-700"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${s === "published" ? "bg-green-500" : s === "pending" ? "bg-amber-400" : "bg-gray-400"}`}
                        />
                        {STATUS_LABEL[s]}
                        {s === item.status && (
                          <span className="ml-auto text-xs text-gray-400">
                            Current
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={() => setConfirmAction("delete-1")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
