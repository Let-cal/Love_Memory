import { dbConnect } from "@/lib/mongodb";
import { WebLinkDataProps } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import WebLink from "../../../../models/WebLink";

// Query parameters validation
const querySchema = z.object({
  category: z
    .enum(["memories", "gifts", "letters", "moments", "other", "all"])
    .optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val > 0 && val <= 100)
    .optional(),
  offset: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 0)
    .optional(),
  sortBy: z
    .enum(["createdAt", "visitCount", "lastVisited", "title"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeInactive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// Interface for MongoDB query
interface MongoQuery {
  isActive?: boolean;
  category?: string;
  tags?: { $in: string[] };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const {
      category,
      tags,
      search,
      limit = 50,
      offset = 0,
      sortBy,
      sortOrder,
      includeInactive = false,
    } = querySchema.parse(queryParams);

    // Build MongoDB query
    const buildQuery = (): MongoQuery => {
      const query: MongoQuery = {};
      if (!includeInactive) query.isActive = true;
      if (category && category !== "all") query.category = category;
      if (tags) {
        const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
        query.tags = { $in: tagArray };
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }
      return query;
    };

    // Build sort object
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Execute query with pagination and populate images
    const executeQuery = async (): Promise<[WebLinkDataProps[], number]> => {
      const query = buildQuery();

      // Use aggregation to efficiently join with images and get first image
      const webLinksWithImages = await WebLink.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: offset },
        { $limit: limit },

        // Lookup to get image count
        {
          $lookup: {
            from: "images",
            localField: "_id",
            foreignField: "webLinkId",
            as: "images",
          },
        },

        // Add computed fields
        {
          $addFields: {
            imageCount: { $size: "$images" },
            // Get the first image (most recent by default)
            firstImage: {
              $cond: {
                if: { $gt: [{ $size: "$images" }, 0] },
                then: { $arrayElemAt: ["$images", 0] },
                else: null,
              },
            },
            // Get recent images (up to 3)
            recentImages: {
              $slice: [
                {
                  $sortArray: {
                    input: "$images",
                    sortBy: { createdAt: -1 },
                  },
                },
                3,
              ],
            },
          },
        },

        // Clean up - remove full images array to save bandwidth
        {
          $project: {
            images: 0,
          },
        },
      ]);

      // Get total count for pagination
      const totalCount = await WebLink.countDocuments(query);

      return [webLinksWithImages, totalCount];
    };

    // Get statistics
    const getStatistics = async () => {
      const [categoryStats, popularTags, totalStats] = await Promise.all([
        WebLink.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        WebLink.aggregate([
          { $match: { isActive: true } },
          { $unwind: "$tags" },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),
        WebLink.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              totalLinks: { $sum: 1 },
              totalVisits: { $sum: "$visitCount" },
              avgVisitsPerLink: { $avg: "$visitCount" },
              lastUpdated: { $max: "$updatedAt" },
            },
          },
        ]),
      ]);

      return {
        categories: categoryStats,
        popularTags: popularTags.map((tag) => ({
          name: tag._id,
          count: tag.count,
        })),
        overview: totalStats[0] || {
          totalLinks: 0,
          totalVisits: 0,
          avgVisitsPerLink: 0,
          lastUpdated: new Date(),
        },
      };
    };

    const [webLinks, totalCount] = await executeQuery();
    const statistics = await getStatistics();

    // Calculate pagination metadata
    const hasMore = offset + limit < totalCount;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      success: true,
      data: {
        webLinks,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore,
          totalPages,
          currentPage,
        },
        statistics,
      },
    });
  } catch (error) {
    console.error("Error fetching web links:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const webLinkId = searchParams.get("id");
    const action = searchParams.get("action");

    if (!webLinkId || action !== "visit") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
        },
        { status: 400 }
      );
    }

    const webLink = await WebLink.findByIdAndUpdate(
      webLinkId,
      {
        $inc: { visitCount: 1 },
        $set: { lastVisited: new Date() },
      },
      { new: true }
    );

    if (!webLink) {
      return NextResponse.json(
        {
          success: false,
          error: "Web link not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        visitCount: webLink.visitCount,
        lastVisited: webLink.lastVisited,
      },
    });
  } catch (error) {
    console.error("Error updating visit count:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
