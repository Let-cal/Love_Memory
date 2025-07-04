import { dbConnect } from "@/lib/mongodb";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Image from "../../../../../../models/Image";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Await params before using its properties
    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image ID" },
        { status: 400 }
      );
    }

    // Use findByIdAndUpdate with atomic operation for better performance
    const updatedImage = await Image.findByIdAndUpdate(
      id,
      [
        {
          $set: {
            isFavorite: { $not: "$isFavorite" },
            updatedAt: new Date(),
          },
        },
      ],
      {
        new: true, // Return the updated document
        runValidators: true,
        select: "_id isFavorite updatedAt", // Only return necessary fields
      }
    );

    if (!updatedImage) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedImage._id.toString(),
        isFavorite: updatedImage.isFavorite,
        updatedAt: updatedImage.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to toggle favorite",
      },
      { status: 500 }
    );
  }
}

// Optional: Support GET method to check current favorite status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Await params before using its properties
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image ID" },
        { status: 400 }
      );
    }

    const image = await Image.findById(id).select("_id isFavorite");

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: image._id.toString(),
        isFavorite: image.isFavorite,
      },
    });
  } catch (error) {
    console.error("Error getting favorite status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get favorite status",
      },
      { status: 500 }
    );
  }
}
