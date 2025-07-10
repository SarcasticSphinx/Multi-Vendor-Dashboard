import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await connectToMongoDB();
    const customer = await Customer.findOne({ user: id }).populate("user");

    return NextResponse.json(customer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: `Failed to fetch the customer of id: ${id}`, details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    const updates = await req.json();

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: id },
      updates,
      {
        new: true,
      }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update customer", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    const deletedCustomer = await Customer.findOneAndDelete({ user: id });

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "customer deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to delete customer", details: message },
      { status: 500 }
    );
  }
}
