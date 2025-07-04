import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  name: { type: String, required: true },
});

export default mongoose.models.Dislike || mongoose.model("Dislike", dislikeSchema);
