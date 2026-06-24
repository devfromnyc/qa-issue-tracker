"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PRIORITY_WEIGHT } from "@/lib/constants";
import BoardFilters from "@/components/BoardFilters";
import IssueCard from "@/components/IssueCard";
import IssueModal from "@/components/IssueModal";

function filterAndSortIssues(
  issues,
  { search, priorityFilter, colorFilter, assigneeFilter, sortBy },
) {
  let list = [...issues];

  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.issueNumber.toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.assigneeName || "").toLowerCase().includes(q),
    );
  }

  if (priorityFilter !== "all") {
    list = list.filter((i) => i.priority === priorityFilter);
  }

  if (colorFilter !== "all") {
    list = list.filter((i) => i.colorTag === colorFilter);
  }

  if (assigneeFilter === "unassigned") {
    list = list.filter((i) => !i.assigneeId);
  } else if (assigneeFilter !== "all") {
    list = list.filter((i) => i.assigneeId === assigneeFilter);
  }

  const sorters = {
    order: (a, b) => a.order - b.order,
    priority: (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority],
    issueNumber: (a, b) =>
      parseInt(a.issueNumber.replace(/\D/g, ""), 10) -
      parseInt(b.issueNumber.replace(/\D/g, ""), 10),
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    assignee: (a, b) =>
      (a.assigneeName || "zzz").localeCompare(b.assigneeName || "zzz"),
  };

  list.sort(sorters[sortBy] || sorters.order);
  return list;
}

function DroppableColumn({ column, children, count }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-slate-900/40 transition-colors ${
        isOver ? "border-indigo-500" : "border-slate-800"
      }`}
    >
      <div className="border-b border-slate-800 px-3 py-3">
        <h3 className="font-medium text-slate-200">{column.title}</h3>
        <span className="text-xs text-slate-500">{count} issues</span>
      </div>
      {children}
    </div>
  );
}

export default function BoardKanban({
  board,
  initialIssues,
  readOnly,
  demoApi,
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [sortBy, setSortBy] = useState("order");
  const [activeId, setActiveId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (demoApi?.assigneeOptions) {
      setAssigneeOptions(demoApi.assigneeOptions);
      return;
    }
    fetch(`/api/boards/${board._id}/assignees`)
      .then((res) => res.json())
      .then((data) => setAssigneeOptions(data.assignees || []))
      .catch(() => setAssigneeOptions([]));
  }, [board._id, demoApi]);

  const filtered = useMemo(
    () =>
      filterAndSortIssues(issues, {
        search,
        priorityFilter,
        colorFilter,
        assigneeFilter,
        sortBy,
      }),
    [issues, search, priorityFilter, colorFilter, assigneeFilter, sortBy],
  );

  const issuesByColumn = useMemo(() => {
    const map = {};
    for (const col of board.columns) {
      map[col.id] = filtered.filter((i) => i.status === col.id);
    }
    return map;
  }, [board.columns, filtered]);

  const activeIssue = activeId ? issues.find((i) => i._id === activeId) : null;

  const persistReorder = useCallback(
    async (nextIssues) => {
      if (demoApi?.reorderIssues) {
        const updated = await demoApi.reorderIssues(nextIssues);
        setIssues(updated);
        return;
      }

      const updates = nextIssues.map((issue, index) => ({
        issueId: issue._id,
        status: issue.status,
        order: index,
      }));

      const res = await fetch("/api/issues/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: board._id, updates }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save order");
      }

      const data = await res.json();
      setIssues(data.issues);
    },
    [board._id, demoApi],
  );

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || readOnly) return;

    const activeIssueItem = issues.find((i) => i._id === active.id);
    if (!activeIssueItem) return;

    const overId = over.id;
    let targetStatus = activeIssueItem.status;
    let targetIndex = 0;

    const columnMatch = board.columns.find((c) => c.id === overId);
    if (columnMatch) {
      targetStatus = columnMatch.id;
      targetIndex = issuesByColumn[targetStatus]?.length ?? 0;
    } else {
      const overIssue = issues.find((i) => i._id === overId);
      if (overIssue) {
        targetStatus = overIssue.status;
        const colIssues = issues
          .filter((i) => i.status === targetStatus)
          .sort((a, b) => a.order - b.order);
        targetIndex = colIssues.findIndex((i) => i._id === overId);
      }
    }

    const next = issues.map((i) => ({ ...i }));
    const moving = next.find((i) => i._id === active.id);
    moving.status = targetStatus;

    const without = next
      .filter((i) => i._id !== active.id)
      .map((i) => ({ ...i }));

    const byStatus = {};
    for (const col of board.columns) {
      byStatus[col.id] = without
        .filter((i) => i.status === col.id)
        .sort((a, b) => a.order - b.order);
    }

    byStatus[targetStatus].splice(targetIndex, 0, moving);

    const flattened = [];
    for (const col of board.columns) {
      byStatus[col.id].forEach((issue, idx) => {
        flattened.push({ ...issue, status: col.id, order: idx });
      });
    }

    setIssues(flattened);

    try {
      await persistReorder(flattened);
    } catch {
      setIssues(issues);
    }
  }

  async function handleSaveIssue(form, existing) {
    if (demoApi?.saveIssue) {
      const updated = await demoApi.saveIssue(form, existing);
      if (existing) {
        setIssues((prev) =>
          prev.map((i) => (i._id === existing._id ? updated : i)),
        );
      } else {
        setIssues((prev) => [...prev, updated]);
      }
      return;
    }

    if (existing) {
      const res = await fetch(`/api/issues/${existing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setIssues((prev) =>
        prev.map((i) => (i._id === existing._id ? data.issue : i)),
      );
    } else {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, boardId: board._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setIssues((prev) => [...prev, data.issue]);
    }
  }

  return (
    <div className="space-y-4">
      <BoardFilters
        search={search}
        onSearchChange={setSearch}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        colorFilter={colorFilter}
        onColorChange={setColorFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        assigneeOptions={assigneeOptions}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {!readOnly && (
        <button
          type="button"
          onClick={() => {
            setEditingIssue(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Add issue
        </button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                count={issuesByColumn[column.id]?.length || 0}
              >
                <SortableContext
                  id={column.id}
                  items={(issuesByColumn[column.id] || []).map((i) => i._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
                    {(issuesByColumn[column.id] || []).map((issue) => (
                      <IssueCard
                        key={issue._id}
                        issue={issue}
                        readOnly={readOnly}
                        onClick={(item) => {
                          setEditingIssue(item);
                          setModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            ))}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <div className="w-72 opacity-90">
              <IssueCard issue={activeIssue} readOnly onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <IssueModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIssue(null);
        }}
        issue={editingIssue}
        columns={board.columns}
        boardId={board._id}
        readOnly={readOnly}
        onSave={handleSaveIssue}
        demoApi={demoApi}
      />
    </div>
  );
}
