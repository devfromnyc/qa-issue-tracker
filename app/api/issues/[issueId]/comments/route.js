import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import Board from "@/models/Board";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";

async function getIssueWithBoard(issueId) {
  await connectDB();
  const issue = await Issue.findById(issueId).lean();
  if (!issue) return null;

  const board = await Board.findById(issue.boardId).lean();
  if (!board) return null;

  return { issue, board };
}

export async function GET(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issueId } = await params;
  const result = await getIssueWithBoard(issueId);

  if (!result || !canAccessBoard(result.board, session.user.id)) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  const comments = await Comment.find({
    issueId,
    boardId: result.issue.boardId,
  })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({
    comments: comments.map((c) => ({
      ...c,
      _id: c._id.toString(),
      issueId: c.issueId.toString(),
      boardId: c.boardId.toString(),
    })),
  });
}

export async function POST(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issueId } = await params;

  try {
    const { body } = await request.json();
    if (!body?.trim()) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 },
      );
    }

    const result = await getIssueWithBoard(issueId);
    if (!result || !canAccessBoard(result.board, session.user.id)) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 });
    }

    if (result.board.status === "archived") {
      return NextResponse.json(
        { error: "Cannot add comments on archived boards." },
        { status: 403 },
      );
    }

    const comment = await Comment.create({
      issueId: result.issue._id,
      boardId: result.issue.boardId,
      authorId: session.user.id,
      authorName: session.user.name || "User",
      body: body.trim(),
    });

    return NextResponse.json(
      {
        comment: {
          ...comment.toObject(),
          _id: comment._id.toString(),
          issueId: comment.issueId.toString(),
          boardId: comment.boardId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment." },
      { status: 500 },
    );
  }
}
