"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BoardKanban from "@/components/BoardKanban";
import {
  DEMO_ASSIGNEES,
  addDemoComment,
  deleteDemoComment,
  getDemoComments,
  loadDemoState,
  reorderDemoIssues,
  resetDemoState,
  saveDemoIssue,
} from "@/lib/demoStore";

export default function DemoPage() {
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(loadDemoState());
  }, []);

  const demoApi = useMemo(() => {
    if (!state) return null;

    return {
      assigneeOptions: DEMO_ASSIGNEES,
      saveIssue: async (form, existing) => {
        const snapshot = structuredClone(state);
        saveDemoIssue(snapshot, form, existing);
        const saved = existing
          ? snapshot.issues.find((i) => i._id === existing._id)
          : snapshot.issues[snapshot.issues.length - 1];
        setState(snapshot);
        return saved;
      },
      reorderIssues: async (nextIssues) => {
        const snapshot = structuredClone(state);
        reorderDemoIssues(snapshot, nextIssues);
        setState(snapshot);
        return snapshot.issues;
      },
      getComments: (issueId) => getDemoComments(state, issueId),
      addComment: async (issueId, body) => {
        const snapshot = structuredClone(state);
        const comment = addDemoComment(snapshot, issueId, body);
        setState(snapshot);
        return comment;
      },
      deleteComment: async (issueId, commentId) => {
        const snapshot = structuredClone(state);
        deleteDemoComment(snapshot, issueId, commentId);
        setState(snapshot);
      },
    };
  }, [state]);

  if (!state || !demoApi) {
    return <div className="p-12 text-center text-slate-400">Loading demo…</div>;
  }

  function handleReset() {
    if (!confirm("Reset the demo board to sample data?")) return;
    setState(resetDemoState());
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8">
      <div className="mb-6 rounded-xl border border-amber-800/50 bg-amber-950/30 px-4 py-3">
        <p className="text-sm text-amber-100">
          <strong>Demo mode</strong> — changes are stored in this browser tab only
          (sessionStorage). Nothing is saved to the server.{" "}
          <Link href="/register" className="underline text-amber-200">
            Create an account
          </Link>{" "}
          to collaborate with your team.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">{state.board.name}</h1>
          <p className="text-slate-400">
            {state.board.projectName}
            {state.board.releaseVersion && ` · v${state.board.releaseVersion}`}
          </p>
          <p className="mt-1 text-xs text-slate-500">{state.board.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Reset demo
          </button>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Sign up to save work
          </Link>
        </div>
      </div>

      <BoardKanban
        board={state.board}
        initialIssues={state.issues}
        readOnly={false}
        demoApi={demoApi}
      />
    </div>
  );
}
