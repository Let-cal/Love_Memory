// app/api/images/[id]/route.ts
import { dbConnect } from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Image from "../../../../../models/Image";
import ImageGroup from "../../../../../models/ImageGroup";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image ID" },
        { status: 400 }
      );
    }

    // Find the image first to get cloudinary public ID and group info
    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    // Store group ID for potential cleanup
    const groupId = image.group;

    // Delete from Cloudinary first
    try {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
      console.log(
        `Successfully deleted image from Cloudinary: ${image.cloudinaryPublicId}`
      );
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
      // This ensures we don't leave orphaned database records
    }

    // Delete from database
    await Image.findByIdAndDelete(id);

    // Optional: If the group now has no images, you might want to handle this
    // For now, we'll just let empty groups exist, but you could add logic here
    if (groupId) {
      const remainingImagesInGroup = await Image.countDocuments({
        group: groupId,
      });
      console.log(`Group ${groupId} now has ${remainingImagesInGroup} images`);

      // Uncomment the following lines if you want to delete empty groups automatically
      // if (remainingImagesInGroup === 0) {
      //   await ImageGroup.findByIdAndDelete(groupId);
      //   console.log(`Deleted empty group: ${groupId}`);
      // }
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        deletedFrom: {
          database: true,
          cloudinary: true,
        },
        message: "Image deleted successfully",
      },
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image ID" },
        { status: 400 }
      );
    }

    // Find the image
    const image = await Image.findById(id).populate(
      "group",
      "name description dateRange"
    );
    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch image",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { caption, groupId, tags } = body;

    // Validate image ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image ID",
        },
        { status: 400 }
      );
    }

    // Find the image
    const image = await Image.findById(id);
    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Image not found",
        },
        { status: 404 }
      );
    }

    // Validate group ID if provided
    if (groupId && groupId !== "ungrouped") {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid group ID",
          },
          { status: 400 }
        );
      }

      const groupExists = await ImageGroup.findById(groupId);
      if (!groupExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Group not found",
          },
          { status: 404 }
        );
      }
    }

    // Build update data with proper typing
    interface UpdateData {
      caption?: string;
      group?: mongoose.Types.ObjectId | null;
      tags?: string[];
    }

    const updateData: UpdateData = {};

    if (caption !== undefined) {
      updateData.caption = caption.trim();
    }

    if (groupId !== undefined) {
      updateData.group =
        groupId === "ungrouped" ? null : new mongoose.Types.ObjectId(groupId);
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags.map((tag: string) => tag.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    const updatedImage = await Image.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("group");

    return NextResponse.json({
      success: true,
      data: {
        ...updatedImage.toObject(),
        id: updatedImage._id.toString(),
        group: updatedImage.group ? updatedImage.group._id.toString() : null,
      },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update image",
      },
      { status: 500 }
    );
  }
}
