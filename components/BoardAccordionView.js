"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { getColumnTheme } from "@/lib/constants";
import IssueCard from "@/components/IssueCard";

function AccordionSection({
  column,
  count,
  expanded,
  onToggle,
  issues,
  readOnly,
  onOpenIssue,
  onOpenConversation,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const columnTheme = getColumnTheme(column.id);

  return (
    <section
      ref={setNodeRef}
      className={`overflow-hidden rounded-xl border border-t-4 transition-colors ${
        isOver
          ? "border-indigo-500 border-t-indigo-500"
          : `border-slate-800 ${columnTheme.columnAccent}`
      } ${columnTheme.columnBody}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/40 ${columnTheme.columnHeader}`}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${columnTheme.dot}`} />
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-slate-100">{column.title}</span>
          <span className="text-xs text-slate-500">{count} issues</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-800/80 p-3 sm:p-4">
          <SortableContext
            id={column.id}
            items={issues.map((i) => i._id)}
            strategy={rectSortingStrategy}
          >
            {issues.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                No issues in this status.
              </p>
            ) : (
              <div className="flex min-h-[80px] flex-wrap gap-3">
                {issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="w-full min-w-[260px] flex-[1_1_280px] max-w-xl"
                  >
                    <IssueCard
                      issue={issue}
                      readOnly={readOnly}
                      onClick={onOpenIssue}
                      onOpenConversation={onOpenConversation}
                    />
                  </div>
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      )}
    </section>
  );
}

export default function BoardAccordionView({
  columns,
  issuesByColumn,
  expandedSections,
  onToggleSection,
  readOnly,
  onOpenIssue,
  onOpenConversation,
}) {
  return (
    <div className="flex flex-col gap-3 pb-4">
      {columns.map((column) => (
        <AccordionSection
          key={column.id}
          column={column}
          count={issuesByColumn[column.id]?.length || 0}
          expanded={expandedSections.has(column.id)}
          onToggle={() => onToggleSection(column.id)}
          issues={issuesByColumn[column.id] || []}
          readOnly={readOnly}
          onOpenIssue={onOpenIssue}
          onOpenConversation={onOpenConversation}
        />
      ))}
    </div>
  );
}
