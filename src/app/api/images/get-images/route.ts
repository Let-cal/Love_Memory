// app/api/images/get-images/route.ts
import { dbConnect } from "@/lib/mongodb";
import mongoose, { FilterQuery } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Image, { IImage } from "../../../../../models/Image";
import ImageGroup, { IImageGroup } from "../../../../../models/ImageGroup";

export interface GetImagesQuery {
  page?: string;
  limit?: string;
  sortBy?: "date" | "name" | "favorites" | "group";
  sortOrder?: "asc" | "desc";
  group?: string;
  search?: string;
  favoritesOnly?: boolean;
  tags?: string;
  startDate?: string;
  endDate?: string;
  webLinkId?: string | null;
}

export interface GetImagesResponse {
  success: boolean;
  data?: {
    images: IImage[];
    groups: IImageGroup[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalImages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy =
      (searchParams.get("sortBy") as GetImagesQuery["sortBy"]) || "date";
    const sortOrder =
      (searchParams.get("sortOrder") as GetImagesQuery["sortOrder"]) || "desc";
    const groupFilter = searchParams.get("group");
    const search = searchParams.get("search");
    const favoritesOnly = searchParams.get("favoritesOnly") === "true";
    const tags = searchParams.get("tags");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const webLinkId = searchParams.get("webLinkId");

    // Build query filter
    const filter: FilterQuery<IImage> = {};

    // Group filter
    if (groupFilter && groupFilter !== "all") {
      if (groupFilter === "ungrouped") {
        filter.group = null;
      } else if (mongoose.Types.ObjectId.isValid(groupFilter)) {
        filter.group = new mongoose.Types.ObjectId(groupFilter);
      }
    }

    // WebLinkId filter
    if (webLinkId === "null") {
      filter.webLinkId = null; // Chỉ lấy hình ảnh không liên kết với WebLink
    } else if (webLinkId && mongoose.Types.ObjectId.isValid(webLinkId)) {
      filter.webLinkId = new mongoose.Types.ObjectId(webLinkId); // Lọc theo WebLink cụ thể nếu có
    }

    // Search filter (caption and tags)
    if (search && search.trim()) {
      filter.$or = [
        { caption: { $regex: search.trim(), $options: "i" } },
        { tags: { $in: [new RegExp(search.trim(), "i")] } },
      ];
    }

    // Favorites filter
    if (favoritesOnly) {
      filter.isFavorite = true;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Date range filter
    if (startDate || endDate) {
      filter.takenAt = {};
      if (startDate) {
        filter.takenAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.takenAt.$lte = new Date(endDate);
      }
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "date":
        sort.takenAt = sortOrder === "asc" ? 1 : -1;
        sort.createdAt = sortOrder === "asc" ? 1 : -1; // Secondary sort
        break;
      case "name":
        sort.caption = sortOrder === "asc" ? 1 : -1;
        sort.createdAt = -1; // Secondary sort
        break;
      case "favorites":
        sort.isFavorite = sortOrder === "asc" ? 1 : -1;
        sort.createdAt = -1; // Secondary sort
        break;
      case "group":
        sort.group = sortOrder === "asc" ? 1 : -1;
        sort.createdAt = -1; // Secondary sort
        break;
      default:
        sort.createdAt = -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [images, totalCount, groups] = await Promise.all([
      Image.find(filter)
        .populate("group", "name description dateRange")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Image.countDocuments(filter),
      ImageGroup.find().populate("imageCount").sort({ createdAt: -1 }).lean(),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: GetImagesResponse = {
      success: true,
      data: {
        images: images as unknown as IImage[],
        groups: groups as unknown as IImageGroup[],
        pagination: {
          currentPage: page,
          totalPages,
          totalImages: totalCount,
          hasNext,
          hasPrev,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching images:", error);

    const errorResponse: GetImagesResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch images",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
