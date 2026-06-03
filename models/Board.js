import mongoose from "mongoose";
import { DEFAULT_COLUMNS } from "@/lib/constants";

const ColumnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const BoardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    columns: {
      type: [ColumnSchema],
      default: () => DEFAULT_COLUMNS,
    },
    ownerId: { type: String, required: true, index: true },
    memberIds: { type: [String], default: [], index: true },
    assigneeRoster: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    isGuestBoard: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    releaseVersion: { type: String, default: "" },
  },
  { timestamps: true },
);

BoardSchema.index({ projectName: "text", name: "text" });

export default mongoose.models.Board || mongoose.model("Board", BoardSchema);
