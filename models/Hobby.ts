import mongoose from "mongoose";

const hobbySchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
  name: { type: String, required: true },
});

export default mongoose.models.Hobby || mongoose.model("Hobby", hobbySchema);
