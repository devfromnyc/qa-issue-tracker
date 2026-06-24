"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { browserLabel, deviceLabel } from "@/lib/constants";

const PRIORITY_STYLES = {
  low: "bg-slate-700 text-slate-200",
  medium: "bg-blue-900/60 text-blue-200",
  high: "bg-amber-900/60 text-amber-200",
  critical: "bg-red-900/70 text-red-200",
};

export default function IssueCard({ issue, onClick, readOnly }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: issue._id,
      disabled: readOnly,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragProps = readOnly ? {} : { ...attributes, ...listeners };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-sm transition-colors hover:border-slate-600 ${
        readOnly ? "cursor-pointer" : "cursor-grab active:cursor-grabbing touch-none"
      }`}
      {...dragProps}
      onClick={() => onClick(issue)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-indigo-400">{issue.issueNumber}</span>
        <div className="flex items-center gap-1.5">
          {issue.commentCount > 0 && (
            <span
              className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
              title="Comments in conversation"
            >
              {issue.commentCount} 💬
            </span>
          )}
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[issue.priority]}`}
          >
            {issue.priority}
          </span>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-medium text-slate-100 line-clamp-2">{issue.title}</h3>

      {(issue.pageName || issue.device || issue.browser) && (
        <p className="mb-1 text-[11px] text-slate-500 line-clamp-1">
          {issue.pageName && <span>{issue.pageName}</span>}
          {issue.pageName && (issue.device || issue.browser) && " · "}
          {issue.device && <span>{deviceLabel(issue.device)}</span>}
          {issue.device && issue.browser && " · "}
          {issue.browser && <span>{browserLabel(issue.browser)}</span>}
        </p>
      )}

      {issue.issueAuthor && (
        <p className="mb-1 text-[11px] text-slate-400">
          <span className="text-slate-500">Author:</span> {issue.issueAuthor}
        </p>
      )}

      {issue.assigneeName && (
        <p className="mb-1 text-[11px] text-slate-400">
          <span className="text-slate-500">Assignee:</span> {issue.assigneeName}
        </p>
      )}
    </article>
  );
}
