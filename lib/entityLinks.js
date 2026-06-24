import { connectDB } from "@/lib/mongodb";
import Board from "@/models/Board";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";

/**
 * Board → Issues → Comments hierarchy.
 * Deletes children before parent so nothing is orphaned.
 */
export async function deleteBoardAndChildren(boardId) {
  await connectDB();

  await Comment.deleteMany({ boardId });
  await Issue.deleteMany({ boardId });
  await Board.findByIdAndDelete(boardId);
}

export async function deleteIssueAndChildren(issueId) {
  await connectDB();

  await Comment.deleteMany({ issueId });
  await Issue.findByIdAndDelete(issueId);
}

/**
 * Ensures issue.status matches a column id on its parent board.
 */
export function resolveIssueStatus(board, requestedStatus) {
  const columnIds = board.columns.map((c) => c.id);
  if (requestedStatus && columnIds.includes(requestedStatus)) {
    return requestedStatus;
  }
  return columnIds[0] || "new_issues";
}
