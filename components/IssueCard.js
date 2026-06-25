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

function ConversationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.034.93 3.952 2.572 5.23.364.292.59.731.58 1.198l-.12 2.299c-.037.698.592 1.23 1.257.97l2.57-1.088a9.721 9.721 0 002.173.245z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function IssueCard({ issue, onClick, onOpenConversation, readOnly }) {
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
  const commentCount = issue.commentCount || 0;

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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenConversation?.(issue);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="relative flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-indigo-300"
            title={
              commentCount > 0
                ? `Open conversation (${commentCount} comment${commentCount === 1 ? "" : "s"})`
                : "Open conversation"
            }
            aria-label={
              commentCount > 0
                ? `Open conversation, ${commentCount} comments`
                : "Open conversation"
            }
          >
            <ConversationIcon />
            {commentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-semibold text-white">
                {commentCount > 99 ? "99+" : commentCount}
              </span>
            )}
          </button>
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
