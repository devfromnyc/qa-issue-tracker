"use client";

import { useEffect, useState } from "react";
import IssueConversation from "@/components/IssueConversation";

const PRIORITY_STYLES = {
  low: "bg-slate-700 text-slate-200",
  medium: "bg-blue-900/60 text-blue-200",
  high: "bg-amber-900/60 text-amber-200",
  critical: "bg-red-900/70 text-red-200",
};

export default function IssueConversationDrawer({
  issue,
  onClose,
  readOnly,
  demoApi,
  onCommentCountChange,
}) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!issue) {
      setEntered(false);
      return;
    }

    setEntered(false);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [issue?._id]);

  useEffect(() => {
    if (!issue) return;

    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [issue, onClose]);

  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 transition-opacity"
        aria-label="Close conversation"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversation-drawer-title"
        className={`relative flex h-full w-full max-w-md flex-col border-l border-slate-700 bg-slate-900 shadow-2xl transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-slate-800 px-5 py-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 font-mono text-xs text-indigo-400">{issue.issueNumber}</p>
              <h2
                id="conversation-drawer-title"
                className="text-base font-semibold leading-snug text-slate-100"
              >
                {issue.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <span
            className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[issue.priority]}`}
          >
            {issue.priority}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
          <IssueConversation
            issueId={issue._id}
            readOnly={readOnly}
            demoApi={demoApi}
            variant="drawer"
            onCommentCountChange={onCommentCountChange}
          />
        </div>
      </aside>
    </div>
  );
}
