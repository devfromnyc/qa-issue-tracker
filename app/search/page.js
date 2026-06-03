"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getColorHex } from "@/lib/constants";

export default function SearchPage() {
  const { status } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [includeArchived, setIncludeArchived] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (q.trim().length < 2) return;

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({
      q: q.trim(),
      includeArchived: String(includeArchived),
    });

    const res = await fetch(`/api/issues/search?${params}`);
    const data = await res.json();
    setResults(data.issues || []);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-white">Issue search</h1>
      <p className="mb-6 text-sm text-slate-400">
        Query issues by keyword across active and historical QA boards.
      </p>

      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search issue #, title, or description…"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-slate-600"
          />
          Include archived project boards
        </label>
        <button
          type="submit"
          disabled={loading || q.trim().length < 2}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {searched && results.length === 0 && !loading && (
        <p className="text-slate-400">No issues matched your search.</p>
      )}

      <ul className="space-y-3">
        {results.map((issue) => (
          <li
            key={issue._id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getColorHex(issue.colorTag) }}
              />
              <span className="font-mono text-sm text-indigo-400">
                {issue.issueNumber}
              </span>
              {issue.boardStatus === "archived" && (
                <span className="rounded bg-slate-800 px-1.5 text-[10px] text-slate-400">
                  archived
                </span>
              )}
            </div>
            <h3 className="font-medium text-slate-100">{issue.title}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {issue.projectName} · {issue.boardName}
              {issue.assigneeName && ` · ${issue.assigneeName}`}
            </p>
            {issue.description && (
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                {issue.description}
              </p>
            )}
            <Link
              href={`/boards/${issue.boardId}`}
              className="mt-2 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              Open board →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
