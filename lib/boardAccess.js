export function canAccessBoard(board, userId) {
  return !!(board && userId);
}

export function isBoardOwner(board, userId) {
  return board?.ownerId === userId;
}

export async function loadAllUsers() {
  const { connectDB } = await import("@/lib/mongodb");
  const User = (await import("@/models/User")).default;

  await connectDB();

  const users = await User.find().select("name email").sort({ name: 1 }).lean();

  return Object.fromEntries(users.map((u) => [u._id.toString(), u]));
}

export async function loadUsersForBoard(board) {
  return loadAllUsers();
}

export function buildAssigneeOptions(board, usersById) {
  const options = [];
  const seen = new Set();

  for (const [userId, user] of Object.entries(usersById)) {
    if (seen.has(userId)) continue;
    seen.add(userId);
    options.push({
      id: userId,
      label: user.name,
      email: user.email,
      type: "user",
    });
  }

  for (const entry of board.assigneeRoster || []) {
    if (!entry.id || seen.has(entry.id)) continue;
    seen.add(entry.id);
    options.push({
      id: entry.id,
      label: entry.name,
      type: "roster",
    });
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}

export function resolveAssigneeName(assigneeId, board, usersById) {
  if (!assigneeId) return null;

  const user = usersById[assigneeId];
  if (user) return user.name;

  const roster = (board.assigneeRoster || []).find((r) => r.id === assigneeId);
  return roster?.name || null;
}

export function isValidAssigneeId(assigneeId, board, usersById) {
  if (!assigneeId) return true;
  const options = buildAssigneeOptions(board, usersById);
  return options.some((o) => o.id === assigneeId);
}
