"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
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

const typeOptions = [
  "Course",
  "Event",
  "Scholarship",
  "Internship",
  "Job",
] as const;

function formatDateForInput(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
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

  useEffect(() => {
    setTitle(item.title);
    setTitleKh(item.title_kh);
    setOrganization(item.organization);
    setSubjectTags(item.subjectTags);
    setStartDate(formatDateForInput(item.startDate));
    setDeadline(formatDateForInput(item.deadline));
    setType(item.type);
    setDescription(item.description);
    setDescriptionKh(item.description_kh);
    setLocation(item.location);
    setApplicationLink(item.application_link);
    setIsFree(item.is_free);
    setImageUrl(item.image_url);
    setLanguage(item.language);
    setSourceName(item.source_name);
    setSourcePlatform(item.source_platform);
    setEligibility(item.eligibility);
    setTargetGroup(item.target_group);
    setFormat(item.format);
    setContactInfo(item.contact_info);
    setTagInput("");
    setTargetGroupInput("");
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

  const handleSave = () => {
    onSave({
      ...item,
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
    });
  };

  const statusLabel =
    item.status === "published"
      ? "Published"
      : item.status === "pending"
        ? "Pending"
        : "Private";

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
          {/* Title */}
          <InputField label="Title" value={title} onChange={setTitle} />
          <InputField
            label="Title (KH)"
            value={title_kh}
            onChange={setTitleKh}
          />

          {/* Org & Subject Tags */}
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

          {/* Start, Deadline, Type, Format */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              placeholder="MM/DD/YYYY"
            />
            <InputField
              label="Deadline"
              value={deadline}
              onChange={setDeadline}
              placeholder="MM/DD/YYYY"
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
            <InputField label="Format" value={format} onChange={setFormat} />
          </div>

          {/* Location & Language */}
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

          {/* Is Free */}
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

          {/* Eligibility & Target Group */}
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

          {/* Application Link & Contact Info */}
          <InputField
            label="Application Link"
            value={application_link}
            onChange={setApplicationLink}
          />
          <InputField
            label="Contact Info"
            value={contact_info}
            onChange={setContactInfo}
          />

          {/* Image URL */}
          <InputField
            label="Image URL"
            value={image_url}
            onChange={setImageUrl}
          />

          {/* Source */}
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

          {/* Description KH */}
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

      {/* Footer */}
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
