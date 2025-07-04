// models/WebLink.ts
import mongoose from "mongoose";

const webLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.WebLink || mongoose.model("WebLink", webLinkSchema);
