// models/ImageGroup.ts
import mongoose from "mongoose";

export interface IImageGroup extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  imageCount?: number;
}

const imageGroupSchema = new mongoose.Schema<IImageGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    dateRange: {
      start: { type: Date },
      end: { type: Date },
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
imageGroupSchema.index({ name: 1 });
imageGroupSchema.index({ createdAt: -1 });

// Virtual to get image count
imageGroupSchema.virtual("imageCount", {
  ref: "Image",
  localField: "_id",
  foreignField: "group",
  count: true,
});

export default mongoose.models.ImageGroup ||
  mongoose.model<IImageGroup>("ImageGroup", imageGroupSchema);