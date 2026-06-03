"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getColorHex } from "@/lib/constants";

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

  const colorHex = getColorHex(issue.colorTag);

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-sm hover:border-slate-600 transition-colors"
      onClick={() => onClick(issue)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-indigo-400">{issue.issueNumber}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[issue.priority]}`}
        >
          {issue.priority}
        </span>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: colorHex }}
          title={issue.colorTag}
        />
        <h3 className="text-sm font-medium text-slate-100 line-clamp-2">{issue.title}</h3>
      </div>

      {issue.assigneeName && (
        <p className="mb-1 text-[11px] text-slate-400">
          <span className="text-slate-500">Assignee:</span> {issue.assigneeName}
        </p>
      )}

      {!readOnly && (
        <button
          type="button"
          className="mt-1 w-full cursor-grab text-left text-[10px] text-slate-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          Drag to move
        </button>
      )}
    </article>
  );
}
