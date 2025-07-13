import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongoose";
import User from "@/models/User.model";
import mongoose from "mongoose";

type Params = Promise<{ id: string }>;

export async function PUT(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const id = params.id;
  try {
    await connectToMongoDB();

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { message: "Missing new image" },
        { status: 400 }
      );
    }

    console.log(image, "Changing profile picture for user ID:", id);


    const user = await User.findById(new mongoose.Types.ObjectId(id));

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }


    user.image = image; 
    await user.save();

    return NextResponse.json(
      { message: "ProfilePicture updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing profile picture:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
