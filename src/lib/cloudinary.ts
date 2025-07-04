// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  folder?: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformation?: any;
  tags?: string[];
}

/**
 * Upload image to Cloudinary from buffer
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || "gallery",
      resource_type: "image" as const,
      transformation: options.transformation || [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
      tags: options.tags || ["gallery"],
      ...options,
    };

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error("Upload failed: No result returned"));
        }
      })
      .end(fileBuffer);
  });
};

/**
 * Upload image from URL
 */
export const uploadFromUrl = async (
  imageUrl: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  try {
    const uploadOptions = {
      folder: options.folder || "gallery",
      resource_type: "image" as const,
      transformation: options.transformation || [
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
      tags: options.tags || ["gallery"],
      ...options,
    };

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
    return result as CloudinaryUploadResult;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Cloudinary URL upload error:", error);
    throw new Error(`Cloudinary URL upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

/**
 * Generate optimized image URL with transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  transformations: unknown[] = []
): string => {
  const defaultTransformations = [
    { quality: "auto" },
    { fetch_format: "auto" },
  ];

  return cloudinary.url(publicId, {
    transformation: [...defaultTransformations, ...transformations],
    secure: true,
  });
};

export default cloudinary;
