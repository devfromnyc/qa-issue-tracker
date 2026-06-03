"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BoardKanban from "@/components/BoardKanban";
import BoardTeamPanel from "@/components/BoardTeamPanel";

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [board, setBoard] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const readOnly = board?.status === "archived";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status !== "authenticated" || !boardId) return;

    async function load() {
      setLoading(true);
      const [boardRes, issuesRes] = await Promise.all([
        fetch(`/api/boards/${boardId}`),
        fetch(`/api/issues?boardId=${boardId}`),
      ]);

      const boardData = await boardRes.json();
      const issuesData = await issuesRes.json();

      if (!boardRes.ok) {
        setError(boardData.error || "Board not found.");
        setLoading(false);
        return;
      }

      setBoard(boardData.board);
      setIssues(issuesData.issues || []);
      setLoading(false);
    }

    load();
  }, [status, boardId, router]);

  async function handleArchive() {
    const res = await fetch(`/api/boards/${boardId}/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setBoard(data.board);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading board…</div>;
  }

  if (error || !board) {
    return (
      <div className="p-12 text-center">
        <p className="text-red-400">{error || "Board not found."}</p>
        <Link href="/boards" className="mt-4 inline-block text-indigo-400">
          ← Back to boards
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/boards" className="text-sm text-slate-400 hover:text-slate-200">
            ← Directory
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">{board.name}</h1>
          <p className="text-slate-400">
            {board.projectName}
            {board.releaseVersion && ` · v${board.releaseVersion}`}
          </p>
          {readOnly && (
            <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              Archived — read-only historical record
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/boards/${boardId}/export`}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            Export CSV
          </a>
          {!readOnly && (
            <button
              type="button"
              onClick={handleArchive}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800"
            >
              Archive board (save to history)
            </button>
          )}
        </div>
      </div>

      <BoardTeamPanel
        board={board}
        readOnly={readOnly}
        onBoardUpdate={async () => {
          const res = await fetch(`/api/boards/${boardId}`);
          const data = await res.json();
          if (res.ok) setBoard(data.board);
        }}
      />

      <BoardKanban board={board} initialIssues={issues} readOnly={readOnly} />
    </div>
  );
}
