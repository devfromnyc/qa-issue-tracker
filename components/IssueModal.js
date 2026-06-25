"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PRIORITIES, DEVICES, BROWSERS } from "@/lib/constants";

const emptyForm = {
  title: "",
  description: "",
  pageName: "",
  device: "",
  browser: "",
  pageLink: "",
  issueAuthor: "",
  priority: "medium",
  status: "new_issues",
  assigneeId: "",
};

export default function IssueModal({
  open,
  onClose,
  onSave,
  issue,
  columns,
  boardId,
  readOnly,
  demoApi,
}) {
  const { data: session } = useSession();
  const [form, setForm] = useState(emptyForm);
  const [assignees, setAssignees] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (issue) {
      setForm({
        title: issue.title,
        description: issue.description || "",
        pageName: issue.pageName || "",
        device: issue.device || "",
        browser: issue.browser || "",
        pageLink: issue.pageLink || "",
        issueAuthor: issue.issueAuthor || "",
        priority: issue.priority,
        status: issue.status,
        assigneeId: issue.assigneeId || "",
      });
    } else {
      setForm({
        ...emptyForm,
        status: columns?.[0]?.id || "new_issues",
        issueAuthor: demoApi ? "You (demo)" : session?.user?.name || "",
      });
    }
    setError("");
  }, [issue, open, columns, session?.user?.name, demoApi]);

  useEffect(() => {
    if (!open) return;
    if (demoApi?.assigneeOptions) {
      setAssignees(demoApi.assigneeOptions);
      return;
    }
    if (!boardId) return;
    fetch(`/api/boards/${boardId}/assignees`)
      .then((res) => res.json())
      .then((data) => setAssignees(data.assignees || []))
      .catch(() => setAssignees([]));
  }, [open, boardId, demoApi]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form, issue);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {readOnly ? "View issue" : issue ? "Edit issue" : "New issue"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {issue && (
            <p className="font-mono text-sm text-indigo-400">{issue.issueNumber}</p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Title *
            </label>
            <input
              required
              disabled={readOnly}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Description
            </label>
            <p className="mb-1 text-[10px] text-slate-500">
              Main report — steps, expected vs actual. Use the conversation icon on
              the card for back-and-forth notes.
            </p>
            <textarea
              rows={4}
              disabled={readOnly}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
              placeholder="Steps to reproduce, expected vs actual behavior…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              On what page
            </label>
            <input
              disabled={readOnly}
              value={form.pageName}
              onChange={(e) => setForm({ ...form, pageName: e.target.value })}
              placeholder="e.g. Login, Dashboard, Checkout"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Device
              </label>
              <select
                disabled={readOnly}
                value={form.device}
                onChange={(e) => setForm({ ...form, device: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Not specified</option>
                {DEVICES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Browser
              </label>
              <select
                disabled={readOnly}
                value={form.browser}
                onChange={(e) => setForm({ ...form, browser: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">Not specified</option>
                {BROWSERS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Page link
            </label>
            <input
              type="url"
              disabled={readOnly}
              value={form.pageLink}
              onChange={(e) => setForm({ ...form, pageLink: e.target.value })}
              placeholder="https://…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Issue author
            </label>
            <input
              disabled={readOnly}
              value={form.issueAuthor}
              onChange={(e) => setForm({ ...form, issueAuthor: e.target.value })}
              placeholder="Who reported this issue"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Priority
              </label>
              <select
                disabled={readOnly}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">
                Status
              </label>
              <select
                disabled={readOnly}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">
              Assignee
            </label>
            <select
              disabled={readOnly}
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">Unassigned</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                  {a.email ? ` (${a.email})` : ""}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? "Saving…" : issue ? "Save changes" : "Create issue"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
