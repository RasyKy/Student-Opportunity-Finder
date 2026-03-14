"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import type { ContentItem } from "@/lib/mock-data";

type EditPostPanelProps = {
  item: ContentItem;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
  onSave: (updated: ContentItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isDuplicate: boolean;
};

const typeOptions = ["Course", "Event", "Scholarship"] as const;

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function EditPostPanel({
  item,
  isFullscreen,
  onToggleFullscreen,
  onClose,
  onSave,
  onDelete,
  onToggleStatus,
  isDuplicate,
}: EditPostPanelProps) {
  const [title, setTitle] = useState(item.title);
  const [organization, setOrganization] = useState(item.organization);
  const [subjectTags, setSubjectTags] = useState<string[]>(item.subjectTags);
  const [tagInput, setTagInput] = useState("");
  const [startDate, setStartDate] = useState(formatDateForInput(item.startDate));
  const [deadline, setDeadline] = useState(formatDateForInput(item.deadline));
  const [type, setType] = useState(item.type);
  const [description, setDescription] = useState(item.description);

  useEffect(() => {
    setTitle(item.title);
    setOrganization(item.organization);
    setSubjectTags(item.subjectTags);
    setStartDate(formatDateForInput(item.startDate));
    setDeadline(formatDateForInput(item.deadline));
    setType(item.type);
    setDescription(item.description);
    setTagInput("");
  }, [item]);

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

  const handleSave = () => {
    onSave({
      ...item,
      title,
      organization,
      subjectTags,
      startDate,
      deadline,
      type,
      description,
    });
  };

  const statusLabel =
    item.status === "published"
      ? "Published"
      : item.status === "pending"
        ? "Pending"
        : "Private";

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">Edit Post</h2>
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
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Duplicate warning */}
        {isDuplicate && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-sm font-medium text-red-600">
              Possible Duplicate
            </span>
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Organisation & Subject Tags row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Organisation
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subject Tags
              </label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 min-h-9">
                {subjectTags.map((tag, i) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder={subjectTags.length === 0 ? "Add tag..." : ""}
                  className="flex-1 min-w-16 bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Start & Type row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Start
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="MM/DD/YYYY"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as ContentItem["type"])
                }
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {typeOptions.map((opt) => (
                  <option key={opt} value={opt.toLowerCase()}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Deadline
            </label>
            <input
              type="text"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full max-w-[calc(50%-0.5rem)] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Description */}
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
        </div>
      </div>

      {/* Panel footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(item.id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {item.status === "published" ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {statusLabel}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
