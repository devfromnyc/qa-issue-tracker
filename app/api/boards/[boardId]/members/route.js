import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard, isBoardOwner } from "@/lib/boardAccess";
import Board from "@/models/Board";
import User from "@/models/User";

export async function POST(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;

  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await connectDB();

    const board = await Board.findById(boardId);
    if (!board || !canAccessBoard(board, session.user.id)) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }

    if (!isBoardOwner(board, session.user.id)) {
      return NextResponse.json(
        { error: "Only the board owner can add team members." },
        { status: 403 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "No registered user with that email. They must register first." },
        { status: 404 },
      );
    }

    const memberId = user._id.toString();
    if (memberId === board.ownerId) {
      return NextResponse.json(
        { error: "Owner is already on the board." },
        { status: 400 },
      );
    }

    if (board.memberIds.includes(memberId)) {
      return NextResponse.json(
        { error: "User is already a team member." },
        { status: 409 },
      );
    }

    board.memberIds.push(memberId);
    await board.save();

    return NextResponse.json({
      member: { id: memberId, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: "Failed to add member." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required." }, { status: 400 });
  }

  await connectDB();

  const board = await Board.findById(boardId);
  if (!board || !canAccessBoard(board, session.user.id)) {
    return NextResponse.json({ error: "Board not found." }, { status: 404 });
  }

  if (!isBoardOwner(board, session.user.id)) {
    return NextResponse.json(
      { error: "Only the board owner can remove team members." },
      { status: 403 },
    );
  }

  board.memberIds = board.memberIds.filter((id) => id !== memberId);
  await board.save();

  return NextResponse.json({ success: true });
}
