import {
  isValidAssigneeId,
  resolveAssigneeName,
  loadUsersForBoard,
} from "@/lib/boardAccess";

export async function normalizeAssignee(board, assigneeId) {
  const id = assigneeId || null;
  const usersById = await loadUsersForBoard(board);

  if (id && !isValidAssigneeId(id, board, usersById)) {
    throw new Error("Invalid assignee for this board.");
  }

  return {
    assigneeId: id,
    assigneeName: id ? resolveAssigneeName(id, board, usersById) : null,
  };
}
