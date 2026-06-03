import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import Board from "@/models/Board";

export async function POST(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const body = await request.json().catch(() => ({}));
  const archive = body.archive !== false;

  await connectDB();

  const board = await Board.findById(boardId);
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (archive) {
    board.status = "archived";
    board.archivedAt = new Date();
  } else {
    board.status = "active";
    board.archivedAt = null;
  }

  await board.save();

  return NextResponse.json({
    board: { ...board.toObject(), _id: board._id.toString() },
  });
}
