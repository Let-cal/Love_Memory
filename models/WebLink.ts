// models/WebLink.ts - Enhanced WebLink model
import mongoose from "mongoose";
import { IImage } from "./Image";

export interface IWebLink extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  category: "memories" | "gifts" | "letters" | "moments" | "other";
  isActive: boolean;
  backgroundColor?: string; // For card customization
  textColor?: string; // For card customization
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  visitCount: number;
  lastVisited?: Date;
  metadata?: {
    siteName?: string;
    siteDescription?: string;
    favicon?: string;
    previewImage?: string;
  };
  // Virtual properties
  imageCount?: number;
  recentImages?: IImage[];
}

const webLinkSchema = new mongoose.Schema<IWebLink>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "URL must be a valid HTTP/HTTPS URL",
      },
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      enum: ["memories", "gifts", "letters", "moments", "other"],
      default: "memories",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
      default: "#ec4899", // Pink-500
    },
    textColor: {
      type: String,
      default: "#ffffff",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    lastVisited: {
      type: Date,
    },
    metadata: {
      siteName: { type: String },
      siteDescription: { type: String },
      favicon: { type: String },
      previewImage: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
webLinkSchema.index({ createdBy: 1, createdAt: -1 });
webLinkSchema.index({ category: 1, createdAt: -1 });
webLinkSchema.index({ tags: 1 });
webLinkSchema.index({ isActive: 1, createdAt: -1 });
webLinkSchema.index({ title: "text", description: "text" }); // Text search

// Virtual for image count
webLinkSchema.virtual("imageCount", {
  ref: "Image",
  localField: "_id",
  foreignField: "webLinkId",
  count: true,
});

// Virtual for recent images
webLinkSchema.virtual("recentImages", {
  ref: "Image",
  localField: "_id",
  foreignField: "webLinkId",
  options: { limit: 3, sort: { createdAt: -1 } },
});

export default mongoose.models.WebLink ||
  mongoose.model<IWebLink>("WebLink", webLinkSchema);
