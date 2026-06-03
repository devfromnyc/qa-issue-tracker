"use client";

import { useCallback, useEffect, useState } from "react";

export default function BoardTeamPanel({ board, readOnly, onBoardUpdate }) {
  const [assignees, setAssignees] = useState([]);
  const [rosterName, setRosterName] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const loadAssignees = useCallback(async () => {
    const res = await fetch(`/api/boards/${board._id}/assignees`);
    const data = await res.json();
    if (res.ok) setAssignees(data.assignees || []);
  }, [board._id]);

  useEffect(() => {
    if (open) loadAssignees();
  }, [open, loadAssignees]);

  async function addRosterName(e) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/boards/${board._id}/roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rosterName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to add name.");
      return;
    }
    setRosterName("");
    onBoardUpdate?.();
    loadAssignees();
  }

  const rosterEntries = assignees.filter((a) => a.type === "roster");
  const userCount = assignees.filter((a) => a.type === "user").length;

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-200 hover:bg-slate-800/50"
      >
        Extra assignee names
        <span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-800 px-4 py-4">
          <p className="text-xs text-slate-400">
            Every signed-in teammate can open and edit this board. All registered
            users ({userCount}) appear in the assignee dropdown automatically.
            Add names here only for people without accounts.
          </p>

          {rosterEntries.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {rosterEntries.map((a) => (
                <li
                  key={a.id}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300"
                >
                  {a.label}
                </li>
              ))}
            </ul>
          )}

          {!readOnly && (
            <form onSubmit={addRosterName} className="flex flex-wrap gap-2">
              <input
                value={rosterName}
                onChange={(e) => setRosterName(e.target.value)}
                placeholder="Name (no account)"
                className="min-w-[220px] flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Add name
              </button>
            </form>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
