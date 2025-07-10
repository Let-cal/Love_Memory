import { uploadFromUrl, uploadToCloudinary } from "@/lib/cloudinary";
import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Image from "../../../../../models/Image";
import ImageGroup from "../../../../../models/ImageGroup";

interface UploadResponse {
  success: boolean;
  data?: {
    images?: Array<{
      id: string;
      url: string;
      cloudinaryPublicId: string;
      caption: string;
      metadata: {
        width?: number;
        height?: number;
        format?: string;
        size?: number;
        originalFilename?: string;
      };
      createdAt: Date;
    }>;
    count?: number;
    id?: string;
    url?: string;
    cloudinaryPublicId?: string;
    caption?: string;
    metadata?: {
      width?: number;
      height?: number;
      format?: string;
      size?: number;
      originalFilename?: string;
    };
    createdAt?: Date;
  };
  error?: string;
  message?: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface FileUploadOptions {
  folder: string;
  tags: string[];
  public_id: string;
}

interface UrlUploadBody {
  imageUrl: string;
  caption?: string;
  groupId?: string;
  tags?: string[];
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    await dbConnect();

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleFileUpload(request);
    } else if (contentType.includes("application/json")) {
      return await handleUrlUpload(request);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Loại nội dung không được hỗ trợ",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("Lỗi API upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi server nội bộ",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

async function handleFileUpload(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không có file nào được cung cấp",
        },
        { status: 400 }
      );
    }

    // Validate files
    const validationError = validateFiles(files);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    // Get metadata from form
    const metadata = extractFormMetadata(formData);

    // Validate group if provided
    if (metadata.groupId) {
      const groupValidationError = await validateGroup(metadata.groupId);
      if (groupValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: groupValidationError,
          },
          { status: 400 }
        );
      }
    }

    // Process file uploads
    const uploadedImages = await processFileUploads(files, metadata);

    return NextResponse.json(
      {
        success: true,
        message: `Đã upload thành công ${uploadedImages.length} ảnh`,
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";
    if (errorMessage.includes("Body exceeded")) {
      return NextResponse.json(
        {
          success: false,
          error: "Kích thước file vượt quá giới hạn 20MB",
          message: "Vui lòng chọn file nhỏ hơn 20MB",
        },
        { status: 413 }
      );
    }
    console.error("Lỗi upload file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể upload file",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

async function handleUrlUpload(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    const body: UrlUploadBody = await request.json();
    const { imageUrl, caption, groupId, tags } = body;

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Yêu cầu cung cấp URL ảnh",
        },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(imageUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Định dạng URL không hợp lệ",
        },
        { status: 400 }
      );
    }

    // Validate group if provided
    if (groupId) {
      const groupValidationError = await validateGroup(groupId);
      if (groupValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: groupValidationError,
          },
          { status: 400 }
        );
      }
    }

    // Upload from URL
    const uploadResult = await processUrlUpload(
      imageUrl,
      caption,
      groupId,
      tags
    );

    return NextResponse.json(
      {
        success: true,
        message: "Đã upload thành công ảnh từ URL",
        data: uploadResult,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("Lỗi upload URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể upload từ URL",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function validateFiles(files: File[]): string | null {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 20 * 1024 * 1024; // 20MB

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return `Loại file không được hỗ trợ: ${file.type}`;
    }

    if (file.size > maxSize) {
      return `File quá lớn: ${file.name}. Kích thước tối đa là 20MB`;
    }
  }

  return null;
}

function extractFormMetadata(formData: FormData) {
  const caption = (formData.get("caption") as string) || "";
  const groupId = (formData.get("groupId") as string) || null;
  const webLinkId = (formData.get("webLinkId") as string) || null;
  const tags = (formData.get("tags") as string) || "";
  const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

  return {
    caption,
    groupId: groupId === "null" ? null : groupId,
    webLinkId: webLinkId === "null" ? null : webLinkId,
    tagsArray,
  };
}

async function validateGroup(groupId: string): Promise<string | null> {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return "Định dạng group ID không hợp lệ";
  }

  const groupExists = await ImageGroup.findById(groupId);
  if (!groupExists) {
    return "Group ID không tồn tại";
  }

  return null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function processFileUploads(
  files: File[],
  metadata: {
    caption: string;
    groupId: string | null;
    webLinkId: string | null;
    tagsArray: string[];
  }
) {
  const uploadPromises = files.map(async (file, index) => {
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const cloudinaryResult = (await uploadToCloudinary(buffer, {
        folder: "gallery",
        tags: [...metadata.tagsArray, "uploaded"],
        public_id: `img_${Date.now()}_${index}`,
      } as FileUploadOptions)) as CloudinaryUploadResult;

      // Create database record
      const imageData = {
        url: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        caption: metadata.caption || file.name.split(".")[0],
        group:
          metadata.groupId && mongoose.Types.ObjectId.isValid(metadata.groupId)
            ? new mongoose.Types.ObjectId(metadata.groupId)
            : null,
        webLinkId:
          metadata.webLinkId &&
          mongoose.Types.ObjectId.isValid(metadata.webLinkId)
            ? new mongoose.Types.ObjectId(metadata.webLinkId)
            : null,
        takenAt: new Date(),
        metadata: {
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          format: cloudinaryResult.format,
          size: cloudinaryResult.bytes,
          originalFilename: file.name,
        },
        tags: metadata.tagsArray,
      };

      const image = new Image(imageData);
      await image.save();

      return {
        id: image._id.toString(),
        url: image.url,
        cloudinaryPublicId: image.cloudinaryPublicId,
        caption: image.caption,
        metadata: image.metadata,
        createdAt: image.createdAt,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error(`Lỗi upload file ${file.name}:`, error);
      throw new Error(`Không thể upload ${file.name}: ${errorMessage}`);
    }
  });

  return await Promise.all(uploadPromises);
}

async function processUrlUpload(
  imageUrl: string,
  caption?: string,
  groupId?: string,
  tags?: string[]
) {
  // Upload from URL to Cloudinary
  const cloudinaryResult = (await uploadFromUrl(imageUrl, {
    folder: "gallery",
    tags: [...(tags || []), "url-upload"],
    public_id: `url_img_${Date.now()}`,
  } as FileUploadOptions)) as CloudinaryUploadResult;

  // Create database record
  const imageData = {
    url: cloudinaryResult.secure_url,
    cloudinaryPublicId: cloudinaryResult.public_id,
    caption: caption || "Uploaded from URL",
    group:
      groupId && mongoose.Types.ObjectId.isValid(groupId)
        ? new mongoose.Types.ObjectId(groupId)
        : null,
    takenAt: new Date(),
    metadata: {
      width: cloudinaryResult.width,
      height: cloudinaryResult.height,
      format: cloudinaryResult.format,
      size: cloudinaryResult.bytes,
      originalFilename: "from-url",
    },
    tags: tags || [],
  };

  const image = new Image(imageData);
  await image.save();

  return {
    id: image._id.toString(),
    url: image.url,
    cloudinaryPublicId: image.cloudinaryPublicId,
    caption: image.caption,
    metadata: image.metadata,
    createdAt: image.createdAt,
  };
}
