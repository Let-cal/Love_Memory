// models/WishOpen.ts
import mongoose from "mongoose";

const wishOpenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  openedAt: { type: Date, default: Date.now },
  wish: { type: mongoose.Schema.Types.ObjectId, ref: 'Wish' },
  quantity: { type: Number, default: 1 }, // x5 x10...
});

export default mongoose.models.WishOpen || mongoose.model("WishOpen", wishOpenSchema);
