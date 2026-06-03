import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import { normalizeAssignee } from "@/lib/issueAssignee";
import Board from "@/models/Board";
import Issue from "@/models/Issue";

export async function GET(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return NextResponse.json({ error: "boardId is required." }, { status: 400 });
  }

  await connectDB();

  const board = await Board.findById(boardId).lean();
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  const issues = await Issue.find({ boardId }).sort({ order: 1, createdAt: 1 }).lean();

  return NextResponse.json({
    issues: issues.map((i) => ({ ...i, _id: i._id.toString(), boardId: i.boardId.toString() })),
  });
}

export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      boardId,
      title,
      description,
      status,
      priority,
      colorTag,
      order,
      assigneeId,
    } = body;

    if (!boardId || !title?.trim()) {
      return NextResponse.json(
        { error: "boardId and title are required." },
        { status: 400 },
      );
    }

    await connectDB();

    const board = await Board.findById(boardId);
    if (!board || !canAccessBoard(board, session.user.id)) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    const count = await Issue.countDocuments({ boardId });
    const issueNumber = `QA-${count + 1}`;

    const columnIds = board.columns.map((c) => c.id);
    const issueStatus = columnIds.includes(status) ? status : "todo";

    const maxOrder = await Issue.findOne({ boardId, status: issueStatus })
      .sort({ order: -1 })
      .select("order")
      .lean();

    let assigneeFields = { assigneeId: null, assigneeName: null };
    try {
      assigneeFields = await normalizeAssignee(board, assigneeId);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const issue = await Issue.create({
      boardId,
      issueNumber,
      title: title.trim(),
      description: description?.trim() || "",
      status: issueStatus,
      priority: priority || "medium",
      colorTag: colorTag || "gray",
      order: order ?? (maxOrder?.order ?? 0) + 1,
      createdBy: session.user.id,
      ...assigneeFields,
    });

    return NextResponse.json(
      {
        issue: {
          ...issue.toObject(),
          _id: issue._id.toString(),
          boardId: issue.boardId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create issue error:", error);
    return NextResponse.json(
      { error: "Failed to create issue." },
      { status: 500 },
    );
  }
}
