// app/api/images/[id]/group/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Image from "@/../../models/Image";
import ImageGroup from "@/../../models/ImageGroup";
import mongoose from "mongoose";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const { groupId } = await request.json();

    // Validate image ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image ID" },
        { status: 400 }
      );
    }

    // Validate group ObjectId if provided
    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 400 }
      );
    }

    // Find the image
    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    // If groupId is provided, verify the group exists
    if (groupId) {
      const group = await ImageGroup.findById(groupId);
      if (!group) {
        return NextResponse.json(
          { success: false, error: "Group not found" },
          { status: 404 }
        );
      }
    }

    // Update image group (null if groupId is null/undefined)
    image.group = groupId ? new mongoose.Types.ObjectId(groupId) : null;
    await image.save();

    return NextResponse.json({
      success: true,
      data: {
        id: image._id,
        group: image.group,
      },
    });
  } catch (error) {
    console.error("Error changing image group:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change group",
      },
      { status: 500 }
    );
  }
}