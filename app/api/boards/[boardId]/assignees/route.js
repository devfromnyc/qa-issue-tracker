import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import {
  canAccessBoard,
  buildAssigneeOptions,
  loadUsersForBoard,
} from "@/lib/boardAccess";
import Board from "@/models/Board";

export async function GET(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  await connectDB();

  const board = await Board.findById(boardId).lean();
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  const usersById = await loadUsersForBoard(board);
  const assignees = buildAssigneeOptions(board, usersById);

  return NextResponse.json({ assignees });
}
