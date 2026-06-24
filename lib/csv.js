import { browserLabel, deviceLabel } from "@/lib/constants";

function escapeCsvCell(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function statusLabel(statusId, columns) {
  const col = columns?.find((c) => c.id === statusId);
  return col?.title || statusId;
}

export function issuesToCsv({ board, issues }) {
  const headers = [
    "Issue #",
    "Title",
    "Description",
    "On what page",
    "Device",
    "Browser",
    "Page link",
    "Issue author",
    "Status",
    "Priority",
    "Assignee",
    "Created",
    "Updated",
  ];

  const rows = issues.map((issue) => [
    issue.issueNumber,
    issue.title,
    issue.description || "",
    issue.pageName || "",
    deviceLabel(issue.device),
    browserLabel(issue.browser),
    issue.pageLink || "",
    issue.issueAuthor || "",
    statusLabel(issue.status, board.columns),
    issue.priority,
    issue.assigneeName || "Unassigned",
    new Date(issue.createdAt).toISOString(),
    new Date(issue.updatedAt).toISOString(),
  ]);

  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  return lines.join("\r\n");
}

export function boardExportFilename(board) {
  const slug = (board.projectName || board.name || "board")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  return `qa-export-${slug}-${date}.csv`;
}
