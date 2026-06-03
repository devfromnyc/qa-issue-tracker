export const DEFAULT_COLUMNS = [
  { id: "todo", title: "To Do", order: 0 },
  { id: "in_progress", title: "In Progress", order: 1 },
  { id: "in_review", title: "In Review", order: 2 },
  { id: "done", title: "Done", order: 3 },
];

export const PRIORITIES = ["low", "medium", "high", "critical"];

export const PRIORITY_WEIGHT = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export const COLOR_TAGS = [
  { id: "red", label: "Bug", hex: "#ef4444" },
  { id: "orange", label: "Regression", hex: "#f97316" },
  { id: "yellow", label: "UI", hex: "#eab308" },
  { id: "green", label: "Enhancement", hex: "#22c55e" },
  { id: "blue", label: "Performance", hex: "#3b82f6" },
  { id: "purple", label: "Accessibility", hex: "#a855f7" },
  { id: "pink", label: "Documentation", hex: "#ec4899" },
  { id: "gray", label: "Other", hex: "#6b7280" },
];

export function getColorHex(colorId) {
  return COLOR_TAGS.find((c) => c.id === colorId)?.hex || COLOR_TAGS[7].hex;
}
