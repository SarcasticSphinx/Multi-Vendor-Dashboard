import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User.model";
import bcrypt from "bcryptjs";
import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import Seller from "@/models/Seller.model";

export async function POST(req: NextRequest) {
  await connectToMongoDB();
  const { name, email, password, role, image } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

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
      console.log(`Customer profile created for user: ${newUser.email}`);
    } catch (error) {
      await User.findByIdAndDelete(newUser._id); 
      console.error(
        "Failed to create customer profile after user creation.",
        error
      );
      return NextResponse.json(
        {
          error: "User registration failed: Could not create associated customer profile.",
        },
        { status: 500 }
      );
    }
  } else if (newUser.role === "seller") { 
    try {
      await Seller.create({
        user: newUser._id,
        storeName: `${newUser.name?.split(" ")[0] || ""}'s Shop`,
        contactInfo: {
          email: newUser.email ,
          phone: "N/A", 
        },
        businessAddress: {
          street: "N/A",
          city: "N/A",
          state: "N/A",
          zipCode: "N/A",
          country: "N/A", 
        },
      });
      console.log(`Seller profile created for user: ${newUser.email}`);
    } catch (error) {
      await User.findByIdAndDelete(newUser._id); 
      console.error(
        "Failed to create seller profile after user creation.", 
        error
      );
      return NextResponse.json(
        {
          error: "User registration failed: Could not create associated seller profile.", 
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