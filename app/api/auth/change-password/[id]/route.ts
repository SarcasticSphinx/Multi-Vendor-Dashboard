import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/mongoose";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

type Params = Promise<{ id: string }>;

export async function PUT(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const id = params.id;
  try {
    await connectToMongoDB();

    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Changing password for user ID:", id);

    const user = await User.findById(new mongoose.Types.ObjectId(id));

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid current password" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds: 10

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
