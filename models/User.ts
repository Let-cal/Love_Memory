// models/User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
