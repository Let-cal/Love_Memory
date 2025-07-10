import mongoose from "mongoose";

export interface IImage extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  url: string;
  cloudinaryPublicId: string;
  caption?: string;
  group?: mongoose.Types.ObjectId | null;
  webLinkId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  takenAt?: Date;
  isFavorite: boolean;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    originalFilename?: string;
  };
  tags?: string[];
  // Virtual properties
  formattedSize?: string;
}

const imageSchema = new mongoose.Schema<IImage>(
  {
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
    cloudinaryPublicId: {
      type: String,
      required: true,
      unique: true, // This already creates an index - don't duplicate with schema.index()
    },
    caption: {
      type: String,
      maxlength: 500,
      trim: true,
      default: "",
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImageGroup",
      default: null,
    },
     webLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WebLink",
      default: null,
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    metadata: {
      width: { type: Number },
      height: { type: Number },
      format: { type: String },
      size: { type: Number },
      originalFilename: { type: String },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Removed duplicate cloudinaryPublicId index since unique: true already creates one
imageSchema.index({ group: 1, createdAt: -1 });
imageSchema.index({ isFavorite: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ takenAt: -1 });
imageSchema.index({ caption: "text" }); // Text search index
imageSchema.index({ webLinkId: 1, createdAt: -1 });

// Virtual for formatted file size
imageSchema.virtual("formattedSize").get(function () {
  if (!this.metadata?.size) return "Unknown";
  const size = this.metadata.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

export default mongoose.models.Image ||
  mongoose.model<IImage>("Image", imageSchema);
