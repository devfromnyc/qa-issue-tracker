import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";
import Board from "@/models/Board";
import Issue from "@/models/Issue";
import User from "@/models/User";

export async function GET(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const q = searchParams.get("q")?.trim();
  const mine = searchParams.get("mine") === "true";
  const project = searchParams.get("project")?.trim();

  await connectDB();

  const filter = {};
  if (status === "archived" || status === "active") {
    filter.status = status;
  }
  if (mine) {
    filter.ownerId = session.user.id;
  }
  if (project) {
    filter.projectName = new RegExp(
      project.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  }

  let boards = await Board.find(filter).sort({ projectName: 1, updatedAt: -1 }).lean();

  if (q) {
    const lower = q.toLowerCase();
    boards = boards.filter(
      (b) =>
        b.name.toLowerCase().includes(lower) ||
        b.projectName.toLowerCase().includes(lower) ||
        (b.releaseVersion || "").toLowerCase().includes(lower),
    );
  }

  const boardIds = boards.map((b) => b._id);
  const issueCounts = await Issue.aggregate([
    { $match: { boardId: { $in: boardIds } } },
    { $group: { _id: "$boardId", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    issueCounts.map((row) => [row._id.toString(), row.count]),
  );

  const ownerIds = [
    ...new Set(
      boards.map((b) => b.ownerId).filter(Boolean),
    ),
  ];
  const owners = await User.find({ _id: { $in: ownerIds } })
    .select("name email")
    .lean();
  const ownerMap = Object.fromEntries(
    owners.map((u) => [u._id.toString(), u]),
  );

  const result = boards.map((b) => {
    const owner = ownerMap[b.ownerId];
    return {
      ...b,
      _id: b._id.toString(),
      issueCount: countMap[b._id.toString()] || 0,
      ownerName: owner?.name || "Unknown",
      isOwnedByMe: b.ownerId === session.user.id,
    };
  });

  const projects = [...new Set(result.map((b) => b.projectName))].sort();

  return NextResponse.json({ boards: result, projects });
}

export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, projectName, description, releaseVersion } = body;

    if (!name?.trim() || !projectName?.trim()) {
      return NextResponse.json(
        { error: "Board name and project name are required." },
        { status: 400 },
      );
    }

    await connectDB();

    const board = await Board.create({
      name: name.trim(),
      projectName: projectName.trim(),
      description: description?.trim() || "",
      releaseVersion: releaseVersion?.trim() || "",
      ownerId: session.user.id,
    });

    return NextResponse.json(
      { board: { ...board.toObject(), _id: board._id.toString() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create board error:", error);
    return NextResponse.json(
      { error: "Failed to create board." },
      { status: 500 },
    );
  }
}
