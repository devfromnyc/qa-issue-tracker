"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BoardDirectoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("active");
  const [boards, setBoards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: tab });
    if (query.trim()) params.set("q", query.trim());
    if (mineOnly) params.set("mine", "true");
    if (projectFilter) params.set("project", projectFilter);

    const res = await fetch(`/api/boards?${params}`);
    const data = await res.json();
    setBoards(data.boards || []);
    setProjects(data.projects || []);
    setLoading(false);
  }, [tab, query, mineOnly, projectFilter]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      loadBoards();
    }
  }, [status, loadBoards, router]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const board of boards) {
      const key = board.projectName || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(board);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [boards]);

  async function handleArchive(boardId, archive) {
    const res = await fetch(`/api/boards/${boardId}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive }),
    });
    if (res.ok) loadBoards();
  }

  if (status === "loading") {
    return <div className="p-12 text-center text-slate-400">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Board directory</h1>
          <p className="text-sm text-slate-400">
            All QA boards across the team — anyone can open and work on any board.
          </p>
        </div>
        <Link
          href="/boards/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + New board
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex rounded-lg border border-slate-700 p-0.5">
          {[
            { id: "active", label: "Active" },
            { id: "archived", label: "Archived" },
            { id: "all", label: "All" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-4 py-1.5 text-sm ${
                tab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search boards…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
        />

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="rounded border-slate-600"
          />
          Created by me
        </label>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        {boards.length} board{boards.length !== 1 ? "s" : ""}
        {tab !== "all" ? ` · ${tab}` : ""}
      </p>

      {loading ? (
        <p className="text-slate-400">Loading directory…</p>
      ) : boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
          <p className="text-slate-400">
            No boards match your filters. Create one to start logging release QA.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([projectName, projectBoards]) => (
            <section key={projectName}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-400">
                {projectName}
              </h2>
              <ul className="space-y-3">
                {projectBoards.map((board) => (
                  <li
                    key={board._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/boards/${board._id}`}
                          className="font-semibold text-slate-100 hover:text-indigo-300"
                        >
                          {board.name}
                        </Link>
                        {board.status === "archived" && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            archived
                          </span>
                        )}
                        {board.isOwnedByMe && (
                          <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] text-indigo-300">
                            yours
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">
                        {board.releaseVersion && `v${board.releaseVersion} · `}
                        Created by {board.ownerName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {board.issueCount} issues · Updated{" "}
                        {new Date(board.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/boards/${board._id}`}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800"
                      >
                        Open
                      </Link>
                      {board.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => handleArchive(board._id, true)}
                          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(board._id, false)}
                          className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
