import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { connectToMongoDB } from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  await connectToMongoDB();
  const { name, email, password, role } = await req.json();

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "buyer",
  });

  return NextResponse.json({ message: "User registered", user });
}
