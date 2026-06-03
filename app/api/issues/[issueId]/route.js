import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import { normalizeAssignee } from "@/lib/issueAssignee";
import Board from "@/models/Board";
import Issue from "@/models/Issue";

async function getAuthorizedIssue(issueId, userId) {
  await connectDB();
  const issue = await Issue.findById(issueId);
  if (!issue) return null;

  const board = await Board.findById(issue.boardId).lean();
  if (!board || !canAccessBoard(board, userId)) return null;

  return { issue, board };
}

export async function PATCH(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issueId } = await params;

  try {
    const body = await request.json();
    const result = await getAuthorizedIssue(issueId, session.user.id);

    if (!result) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 });
    }

    const { issue, board } = result;
    const allowed = [
      "title",
      "description",
      "status",
      "priority",
      "colorTag",
      "order",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "status") {
          const valid = board.columns.some((c) => c.id === body.status);
          if (valid) issue.status = body.status;
        } else {
          issue[key] = body[key];
        }
      }
    }

    if (body.assigneeId !== undefined) {
      try {
        const fields = await normalizeAssignee(board, body.assigneeId);
        issue.assigneeId = fields.assigneeId;
        issue.assigneeName = fields.assigneeName;
      } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    }

    await issue.save();

    return NextResponse.json({
      issue: {
        ...issue.toObject(),
        _id: issue._id.toString(),
        boardId: issue.boardId.toString(),
      },
    });
  } catch (error) {
    console.error("Update issue error:", error);
    return NextResponse.json(
      { error: "Failed to update issue." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { issueId } = await params;
  const result = await getAuthorizedIssue(issueId, session.user.id);

  if (!result) {
    return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  }

  await Issue.findByIdAndDelete(issueId);

  return NextResponse.json({ success: true });
}
