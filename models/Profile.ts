import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  personName: { type: String, required: true }, // Ex: "Me" / "Bae"
  birthday: Date,
  favoriteColor: String,
  bio: String,
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model("Profile", profileSchema);
