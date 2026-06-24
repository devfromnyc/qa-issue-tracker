import { DEFAULT_COLUMNS } from "@/lib/constants";

const STORAGE_KEY = "qa-tracker-demo";

export const DEMO_ASSIGNEES = [
  { id: "demo-alex", label: "Alex Chen", email: "alex@demo.local", type: "user" },
  { id: "demo-sam", label: "Sam Rivera", email: "sam@demo.local", type: "user" },
  { id: "demo-jordan", label: "Jordan Lee", email: "jordan@demo.local", type: "user" },
];

function now() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createSeedDemoState() {
  const boardId = "demo-board";
  const issue1 = uid("demo-issue");
  const issue2 = uid("demo-issue");
  const issue3 = uid("demo-issue");
  const t = now();

  return {
    board: {
      _id: boardId,
      name: "Sprint 12 Release QA",
      projectName: "Customer Portal",
      releaseVersion: "2.4.0",
      description: "Sample board — try drag-and-drop, filters, and comments.",
      status: "active",
      columns: DEFAULT_COLUMNS,
    },
    issues: [
      {
        _id: issue1,
        boardId,
        issueNumber: "QA-1",
        title: "Login button unresponsive on mobile Safari",
        description:
          "Steps: Open login on iPhone Safari, tap Sign in.\nExpected: Form submits.\nActual: No response.",
        status: "todo",
        priority: "high",
        colorTag: "red",
        order: 0,
        assigneeId: "demo-alex",
        assigneeName: "Alex Chen",
        createdAt: t,
        updatedAt: t,
        commentCount: 1,
      },
      {
        _id: issue2,
        boardId,
        issueNumber: "QA-2",
        title: "Dashboard chart labels overlap at 1280px",
        description: "Regression on analytics dashboard at laptop breakpoint.",
        status: "in_progress",
        priority: "medium",
        colorTag: "yellow",
        order: 0,
        assigneeId: "demo-sam",
        assigneeName: "Sam Rivera",
        createdAt: t,
        updatedAt: t,
        commentCount: 0,
      },
      {
        _id: issue3,
        boardId,
        issueNumber: "QA-3",
        title: "Export CSV missing assignee column",
        description: "CSV export should include assignee name.",
        status: "in_review",
        priority: "low",
        colorTag: "green",
        order: 0,
        assigneeId: null,
        assigneeName: null,
        createdAt: t,
        updatedAt: t,
        commentCount: 0,
      },
    ],
    comments: {
      [issue1]: [
        {
          _id: uid("demo-comment"),
          issueId: issue1,
          boardId,
          authorId: "demo-you",
          authorName: "You (demo)",
          body: "Reproduced on iOS 17 — might be related to the autofill overlay.",
          createdAt: t,
        },
      ],
    },
    issueCounter: 3,
  };
}

export function loadDemoState() {
  if (typeof window === "undefined") return createSeedDemoState();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedDemoState();
    return JSON.parse(raw);
  } catch {
    return createSeedDemoState();
  }
}

export function saveDemoState(state) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetDemoState() {
  const seed = createSeedDemoState();
  saveDemoState(seed);
  return seed;
}

export function resolveDemoAssignee(assigneeId) {
  if (!assigneeId) return { assigneeId: null, assigneeName: null };
  const person = DEMO_ASSIGNEES.find((a) => a.id === assigneeId);
  return {
    assigneeId,
    assigneeName: person?.label || null,
  };
}

export function saveDemoIssue(state, form, existing) {
  const t = now();
  const boardId = state.board._id;

  if (existing) {
    const assignee = resolveDemoAssignee(form.assigneeId);
    state.issues = state.issues.map((i) =>
      i._id === existing._id
        ? {
            ...i,
            ...form,
            ...assignee,
            updatedAt: t,
          }
        : i,
    );
  } else {
    const nextNum = (state.issueCounter || state.issues.length) + 1;
    const assignee = resolveDemoAssignee(form.assigneeId);
    const issue = {
      _id: uid("demo-issue"),
      boardId,
      issueNumber: `QA-${nextNum}`,
      title: form.title,
      description: form.description || "",
      status: form.status,
      priority: form.priority,
      colorTag: form.colorTag,
      order: state.issues.filter((i) => i.status === form.status).length,
      ...assignee,
      createdAt: t,
      updatedAt: t,
      commentCount: 0,
    };
    state.issueCounter = nextNum;
    state.issues.push(issue);
    state.comments[issue._id] = [];
  }

  saveDemoState(state);
  return state;
}

export function reorderDemoIssues(state, nextIssues) {
  state.issues = nextIssues.map((issue, index) => ({
    ...issue,
    order: index,
    updatedAt: now(),
  }));
  saveDemoState(state);
  return state;
}

export function getDemoComments(state, issueId) {
  return state.comments[issueId] || [];
}

export function addDemoComment(state, issueId, body) {
  const comment = {
    _id: uid("demo-comment"),
    issueId,
    boardId: state.board._id,
    authorId: "demo-you",
    authorName: "You (demo)",
    body: body.trim(),
    createdAt: now(),
  };

  if (!state.comments[issueId]) state.comments[issueId] = [];
  state.comments[issueId].push(comment);

  state.issues = state.issues.map((i) =>
    i._id === issueId
      ? { ...i, commentCount: (state.comments[issueId]?.length || 0), updatedAt: now() }
      : i,
  );

  saveDemoState(state);
  return comment;
}

export function deleteDemoComment(state, issueId, commentId) {
  state.comments[issueId] = (state.comments[issueId] || []).filter(
    (c) => c._id !== commentId,
  );
  state.issues = state.issues.map((i) =>
    i._id === issueId
      ? { ...i, commentCount: state.comments[issueId]?.length || 0, updatedAt: now() }
      : i,
  );
  saveDemoState(state);
  return state;
}
