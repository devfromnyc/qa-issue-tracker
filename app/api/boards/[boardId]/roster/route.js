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

  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    await connectDB();

    const board = await Board.findById(boardId);
    if (!board || !canAccessBoard(board, session.user.id)) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    const entry = {
      id: `roster_${crypto.randomUUID()}`,
      name: name.trim(),
    };

    board.assigneeRoster.push(entry);
    await board.save();

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Add roster error:", error);
    return NextResponse.json({ error: "Failed to add name." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const { searchParams } = new URL(request.url);
  const rosterId = searchParams.get("rosterId");

  if (!rosterId) {
    return NextResponse.json({ error: "rosterId is required." }, { status: 400 });
  }

  await connectDB();

  const board = await Board.findById(boardId);
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  board.assigneeRoster = board.assigneeRoster.filter((r) => r.id !== rosterId);
  await board.save();

  return NextResponse.json({ success: true });
}
