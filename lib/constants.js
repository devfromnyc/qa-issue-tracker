export const DEFAULT_COLUMNS = [
  { id: "new_issues", title: "New Issues", order: 0 },
  { id: "in_progress", title: "In Progress", order: 1 },
  { id: "ready_for_qa", title: "Ready for QA", order: 2 },
  { id: "ready_for_uat", title: "Ready for UAT", order: 3 },
  { id: "issue_not_resolved", title: "Issue Not Resolved", order: 4 },
  { id: "issue_resolved", title: "Issue Resolved", order: 5 },
  { id: "prod_issue_out_of_scope", title: "Prod Issue/Out of Scope", order: 6 },
];

export const PRIORITIES = ["low", "medium", "high", "critical"];

/** Same limit as a Twitter/X post (legacy 280-character tweet). */
export const CARD_DESCRIPTION_LIMIT = 280;

export function previewCardDescription(text, limit = CARD_DESCRIPTION_LIMIT) {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}…`;
}

export const PRIORITY_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const PRIORITY_THEME = {
  low: {
    badge: "bg-slate-700 text-slate-200",
    label: "Low",
  },
  medium: {
    badge: "bg-blue-900/70 text-blue-200",
    label: "Medium",
  },
  high: {
    badge: "bg-amber-900/70 text-amber-200",
    label: "High",
  },
  critical: {
    badge: "bg-red-900/80 text-red-200",
    label: "Critical",
  },
};

export function getPriorityTheme(priority) {
  return PRIORITY_THEME[priority] || PRIORITY_THEME.medium;
}

/** Workflow column + card colors (by issue status). */
export const COLUMN_THEME = {
  new_issues: {
    columnAccent: "border-t-stone-200",
    columnHeader: "bg-stone-100/12",
    columnBody: "bg-stone-100/5",
    cardBorder: "border-l-stone-200",
    cardBg: "bg-stone-100/8",
    cardHover: "hover:border-stone-200/80",
    dot: "bg-stone-200",
  },
  in_progress: {
    columnAccent: "border-t-indigo-500",
    columnHeader: "bg-indigo-950/30",
    columnBody: "bg-indigo-950/10",
    cardBorder: "border-l-indigo-500",
    cardBg: "bg-indigo-950/15",
    cardHover: "hover:border-indigo-400/70",
    dot: "bg-indigo-500",
  },
  ready_for_qa: {
    columnAccent: "border-t-amber-800",
    columnHeader: "bg-amber-950/40",
    columnBody: "bg-amber-950/15",
    cardBorder: "border-l-amber-800",
    cardBg: "bg-amber-950/20",
    cardHover: "hover:border-amber-700/80",
    dot: "bg-amber-800",
  },
  ready_for_uat: {
    columnAccent: "border-t-yellow-700",
    columnHeader: "bg-yellow-950/35",
    columnBody: "bg-yellow-950/12",
    cardBorder: "border-l-yellow-700",
    cardBg: "bg-yellow-950/15",
    cardHover: "hover:border-yellow-600/80",
    dot: "bg-yellow-700",
  },
  issue_not_resolved: {
    columnAccent: "border-t-slate-500",
    columnHeader: "bg-slate-800/50",
    columnBody: "bg-slate-800/20",
    cardBorder: "border-l-slate-500",
    cardBg: "bg-slate-800/25",
    cardHover: "hover:border-slate-400/70",
    dot: "bg-slate-500",
  },
  issue_resolved: {
    columnAccent: "border-t-green-500",
    columnHeader: "bg-green-950/35",
    columnBody: "bg-green-950/12",
    cardBorder: "border-l-green-500",
    cardBg: "bg-green-950/15",
    cardHover: "hover:border-green-400/70",
    dot: "bg-green-500",
  },
  prod_issue_out_of_scope: {
    columnAccent: "border-t-pink-500",
    columnHeader: "bg-pink-950/35",
    columnBody: "bg-pink-950/12",
    cardBorder: "border-l-pink-500",
    cardBg: "bg-pink-950/15",
    cardHover: "hover:border-pink-400/70",
    dot: "bg-pink-500",
  },
};

const DEFAULT_COLUMN_THEME = {
  columnAccent: "border-t-slate-700",
  columnHeader: "bg-transparent",
  columnBody: "bg-transparent",
  cardBorder: "border-l-slate-600",
  cardBg: "bg-slate-900/90",
  cardHover: "hover:border-slate-500",
  dot: "bg-slate-600",
};

export function getColumnTheme(columnId) {
  return COLUMN_THEME[columnId] || DEFAULT_COLUMN_THEME;
}

export const DEVICES = [
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
];

export const BROWSERS = [
  { id: "chrome", label: "Chrome" },
  { id: "firefox", label: "Firefox" },
  { id: "edge", label: "Edge" },
  { id: "safari", label: "Safari" },
  { id: "all", label: "All browsers" },
];

export function deviceLabel(deviceId) {
  return DEVICES.find((d) => d.id === deviceId)?.label || deviceId || "";
}

export function browserLabel(browserId) {
  return BROWSERS.find((b) => b.id === browserId)?.label || browserId || "";
}
