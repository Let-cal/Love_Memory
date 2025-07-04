import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";

export default async function handler(req, res) {
  try {
    await dbConnect();
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.status(200).json({ message: "MongoDB Connected", collections });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Connection failed", details: error.message });
  }
}
