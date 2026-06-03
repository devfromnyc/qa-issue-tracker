import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import Board from "@/models/Board";
import Issue from "@/models/Issue";

export async function GET(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const boardId = searchParams.get("boardId");
  const includeArchived = searchParams.get("includeArchived") === "true";

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters." },
      { status: 400 },
    );
  }

  await connectDB();

  const boardFilter = {};
  if (!includeArchived) {
    boardFilter.status = "active";
  }

  const userBoards = await Board.find(boardFilter).select("_id name projectName status").lean();
  const boardMap = Object.fromEntries(
    userBoards.map((b) => [b._id.toString(), b]),
  );

  let boardIds = userBoards.map((b) => b._id);
  if (boardId) {
    if (!boardMap[boardId]) {
      return NextResponse.json({ error: "Board not found." }, { status: 404 });
    }
    boardIds = [boardId];
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const issues = await Issue.find({
    boardId: { $in: boardIds },
    $or: [
      { title: regex },
      { description: regex },
      { issueNumber: regex },
      { assigneeName: regex },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const results = issues.map((issue) => {
    const board = boardMap[issue.boardId.toString()];
    return {
      ...issue,
      _id: issue._id.toString(),
      boardId: issue.boardId.toString(),
      boardName: board?.name,
      projectName: board?.projectName,
      boardStatus: board?.status,
    };
  });

  return NextResponse.json({ issues: results, query: q });
}
