import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";

export async function POST(req: NextRequest) {
  await connectToMongoDB();
  const { name, email, password, role, image } = await req.json();

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "customer",
    image: image || "",
  });

  if (newUser.role === "customer") {
    try {
      await Customer.create({
        user: newUser._id,
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
      });
    } catch (error) {
      await User.findByIdAndDelete(newUser._id);
      console.error(
        "Failed to create customer profile after user creation.",
        error
      );
      return NextResponse.json(
        {
          error:
            "User registration failed: Could not create associated customer profile.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "User registered", newUser },
    { status: 201 }
  );
}
