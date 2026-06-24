import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import Board from "@/models/Board";
import Issue from "@/models/Issue";
import Comment from "@/models/Comment";

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

  const [issues, commentMatches] = await Promise.all([
    Issue.find({
      boardId: { $in: boardIds },
      $or: [
        { title: regex },
        { description: regex },
        { issueNumber: regex },
        { pageName: regex },
        { pageLink: regex },
        { issueAuthor: regex },
        { assigneeName: regex },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean(),
    Comment.find({ boardId: { $in: boardIds }, body: regex })
      .select("issueId")
      .limit(50)
      .lean(),
  ]);

  const issueIdSet = new Set(issues.map((i) => i._id.toString()));
  const extraIds = [
    ...new Set(
      commentMatches
        .map((c) => c.issueId.toString())
        .filter((id) => !issueIdSet.has(id)),
    ),
  ];

  let extraIssues = [];
  if (extraIds.length > 0) {
    extraIssues = await Issue.find({ _id: { $in: extraIds } }).lean();
  }

  const merged = [...issues, ...extraIssues].slice(0, 50);

  const results = merged.map((issue) => {
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
