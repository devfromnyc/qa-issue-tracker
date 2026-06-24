export const DEFAULT_COLUMNS = [
  { id: "new_issues", title: "New Issues", order: 0 },
  { id: "in_progress", title: "In Progress", order: 1 },
  { id: "ready_for_uat_qa", title: "Ready for UAT/QA", order: 2 },
  { id: "issue_not_resolved", title: "Issue Not Resolved", order: 3 },
  { id: "issue_resolved", title: "Issue Resolved", order: 4 },
  { id: "prod_issue_out_of_scope", title: "Prod Issue/Out of Scope", order: 5 },
];

export const PRIORITIES = ["low", "medium", "high", "critical"];

export const PRIORITY_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

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
