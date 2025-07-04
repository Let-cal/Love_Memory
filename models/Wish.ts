// models/Wish.ts
import mongoose from "mongoose";

const wishSchema = new mongoose.Schema({
  message: { type: String, required: true },
  topic: String, // Valentine, Birthday,...
  availableDate: Date,
  tags: [String],
  isRare: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Wish || mongoose.model("Wish", wishSchema);
