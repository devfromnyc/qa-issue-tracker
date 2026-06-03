"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function NewBoardPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [releaseVersion, setReleaseVersion] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        projectName,
        releaseVersion,
        description,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create board.");
      return;
    }

    router.push(`/boards/${data.board._id}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/boards" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back to boards
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold text-white">New QA board</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Board name *
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 12 Release QA"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Project name *
          </label>
          <input
            required
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Customer Portal"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Release version
          </label>
          <input
            value={releaseVersion}
            onChange={(e) => setReleaseVersion(e.target.value)}
            placeholder="e.g. 2.4.0"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create board"}
        </button>
      </form>
    </div>
  );
}
