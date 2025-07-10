// app/api/web-link/create/route.ts
import { dbConnect } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import WebLink from "../../../../../models/WebLink";

// Validation schema
const createWebLinkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  url: z.string().url("Invalid URL format"),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.array(z.string().min(1).max(50)).max(20, "Too many tags").default([]),
  category: z
    .enum(["memories", "gifts", "letters", "moments", "other"])
    .default("memories"),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .default("#ec4899"),
  textColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .default("#ffffff"),
  metadata: z
    .object({
      siteName: z.string().optional(),
      siteDescription: z.string().optional(),
      favicon: z.string().optional(),
      previewImage: z.string().url().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate input
    const validatedData = createWebLinkSchema.parse(body);

    // Clean and normalize tags
    const cleanTags = validatedData.tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0)
      .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates

    // Check if URL already exists
    const existingWebLink = await WebLink.findOne({
      url: validatedData.url,
      isActive: true,
    });

    if (existingWebLink) {
      return NextResponse.json(
        {
          success: false,
          error: "A web link with this URL already exists",
        },
        { status: 400 }
      );
    }

    // Create new WebLink
    const webLink = new WebLink({
      ...validatedData,
      tags: cleanTags,
      visitCount: 0,
      isActive: true,
    });

    await webLink.save();

    // Populate virtual fields for response
    await webLink.populate([
      { path: "imageCount" },
      { path: "recentImages", select: "url thumbnailUrl caption createdAt" },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: webLink,
        message: "Web link created successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating web link:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === "MongoError") {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate entry detected",
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
