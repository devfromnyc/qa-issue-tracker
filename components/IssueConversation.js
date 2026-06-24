"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function formatWhen(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function IssueConversation({ issueId, readOnly, demoApi }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    if (demoApi?.getComments) {
      setComments(demoApi.getComments(issueId));
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/issues/${issueId}/comments`);
    const data = await res.json();
    if (res.ok) {
      setComments(data.comments || []);
    }
    setLoading(false);
  }, [issueId, demoApi]);

  useEffect(() => {
    if (issueId) loadComments();
  }, [issueId, loadComments]);

  async function handlePost(e) {
    e.preventDefault();
    if (readOnly || !body.trim()) return;

    setPosting(true);
    setError("");

    if (demoApi?.addComment) {
      const comment = await demoApi.addComment(issueId, body);
      setPosting(false);
      if (!comment) {
        setError("Failed to post comment.");
        return;
      }
      setBody("");
      setComments((prev) => [...prev, comment]);
      return;
    }

    const res = await fetch(`/api/issues/${issueId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const data = await res.json();
    setPosting(false);

    if (!res.ok) {
      setError(data.error || "Failed to post comment.");
      return;
    }

    setBody("");
    setComments((prev) => [...prev, data.comment]);
  }

  async function handleDelete(commentId) {
    if (!confirm("Delete this comment?")) return;

    if (demoApi?.deleteComment) {
      await demoApi.deleteComment(issueId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      return;
    }

    const res = await fetch(`/api/issues/${issueId}/comments/${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    }
  }

  const ownAuthorId = demoApi ? "demo-you" : session?.user?.id;

  return (
    <div className="border-t border-slate-800 pt-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-200">Conversation</h3>
      <p className="mb-3 text-xs text-slate-500">
        Notes, questions, and updates — use this when details need clarification.
      </p>

      {loading ? (
        <p className="text-xs text-slate-500">Loading conversation…</p>
      ) : comments.length === 0 ? (
        <p className="mb-3 text-xs text-slate-500">No comments yet.</p>
      ) : (
        <ul className="mb-4 max-h-48 space-y-3 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isOwn = comment.authorId === ownAuthorId;
            return (
              <li
                key={comment._id}
                className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-300">
                    {comment.authorName}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-500">
                    {formatWhen(comment.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-300">
                  {comment.body}
                </p>
                {isOwn && !readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment._id)}
                    className="mt-1 text-[10px] text-slate-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {readOnly ? (
        <p className="text-xs text-slate-500 italic">
          Archived board — conversation is read-only.
        </p>
      ) : (
        <form onSubmit={handlePost} className="space-y-2">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a note or reply…"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
          {error && (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-slate-600 disabled:opacity-50"
          >
            {posting ? "Posting…" : "Add comment"}
          </button>
        </form>
      )}
    </div>
  );
}
