import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import { deleteBoardAndChildren } from "@/lib/entityLinks";
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

  return NextResponse.json({
    board: { ...board, _id: board._id.toString() },
  });
}

export async function PATCH(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;

  try {
    const body = await request.json();
    await connectDB();

    const board = await Board.findById(boardId);
    if (!board || !canAccessBoard(board, session.user.id)) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    const allowed = ["name", "projectName", "description", "releaseVersion", "columns"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        board[key] = body[key];
      }
    }

    await board.save();

    return NextResponse.json({
      board: { ...board.toObject(), _id: board._id.toString() },
    });
  } catch (error) {
    console.error("Update board error:", error);
    return NextResponse.json(
      { error: "Failed to update board." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  await connectDB();

  const board = await Board.findById(boardId);
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  await deleteBoardAndChildren(boardId);

  return NextResponse.json({ success: true });
}
