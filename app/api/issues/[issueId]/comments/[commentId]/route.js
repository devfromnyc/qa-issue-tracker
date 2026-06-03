import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import Board from "@/models/Board";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";

export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issueId, commentId } = await params;

  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment || comment.issueId.toString() !== issueId) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const issue = await Issue.findById(issueId).lean();
  const board = issue ? await Board.findById(issue.boardId).lean() : null;

  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  if (board.status === "archived") {
    return NextResponse.json(
      { error: "Cannot delete comments on archived boards." },
      { status: 403 },
    );
  }

  if (comment.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You can only delete your own comments." },
      { status: 403 },
    );
  }

  await Comment.findByIdAndDelete(commentId);

  return NextResponse.json({ success: true });
}
