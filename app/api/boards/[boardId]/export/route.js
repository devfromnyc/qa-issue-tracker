import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import { canAccessBoard } from "@/lib/boardAccess";
import { issuesToCsv, boardExportFilename } from "@/lib/csv";
import Board from "@/models/Board";
import Issue from "@/models/Issue";

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

  const issues = await Issue.find({ boardId })
    .sort({ issueNumber: 1 })
    .lean();

  const csv = issuesToCsv({ board, issues });
  const filename = boardExportFilename(board);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
