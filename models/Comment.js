import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      index: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

CommentSchema.index({ body: "text" });
CommentSchema.index({ boardId: 1, issueId: 1 });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
