import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    issueNumber: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, required: true, default: "todo" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    colorTag: { type: String, default: "gray" },
    order: { type: Number, default: 0 },
    assigneeId: { type: String, default: null, index: true },
    assigneeName: { type: String, default: null },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

IssueSchema.index({ title: "text", description: "text", issueNumber: "text" });
IssueSchema.index({ boardId: 1, issueNumber: 1 }, { unique: true });

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);
