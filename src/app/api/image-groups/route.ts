// app/api/image-groups/route.ts
import { dbConnect } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Image from "../../../../models/Image";
import ImageGroup from "../../../../models/ImageGroup";

export async function GET() {
  try {
    await dbConnect();

    const groups = await ImageGroup.find({}).sort({ name: 1 }).lean();

    // Get image counts for each group
    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const imageCount = await Image.countDocuments({ group: group._id });
        return {
          ...group,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          id: (group._id as any).toString(),
          imageCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: groupsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching image groups:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch image groups",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, dateRange } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Group name is required",
        },
        { status: 400 }
      );
    }

    // Check if group with same name already exists
    const existingGroup = await ImageGroup.findOne({
      name: name.trim(),
    });

    if (existingGroup) {
      return NextResponse.json(
        {
          success: false,
          error: "A group with this name already exists",
        },
        { status: 409 }
      );
    }

    const newGroup = new ImageGroup({
      name: name.trim(),
      description: description?.trim() || "",
      dateRange: dateRange || undefined,
    });

    const savedGroup = await newGroup.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...savedGroup.toObject(),
          id: savedGroup._id.toString(),
          imageCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating image group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create image group",
      },
      { status: 500 }
    );
  }
}
