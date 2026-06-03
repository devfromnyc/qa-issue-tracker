import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/auth";
import Board from "@/models/Board";
import Issue from "@/models/Issue";

export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId, updates } = await request.json();

    if (!boardId || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "boardId and updates array are required." },
        { status: 400 },
      );
    }

    await connectDB();

    const board = await Board.findById(boardId).lean();
    if (!board || !canAccessBoard(board, session.user.id)) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    const bulk = updates.map(({ issueId, status, order }) => ({
      updateOne: {
        filter: { _id: issueId, boardId },
        update: { $set: { status, order } },
      },
    }));

    if (bulk.length > 0) {
      await Issue.bulkWrite(bulk);
    }

    const issues = await Issue.find({ boardId }).sort({ order: 1 }).lean();

    return NextResponse.json({
      issues: issues.map((i) => ({
        ...i,
        _id: i._id.toString(),
        boardId: i.boardId.toString(),
      })),
    });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder issues." },
      { status: 500 },
    );
  }
}
