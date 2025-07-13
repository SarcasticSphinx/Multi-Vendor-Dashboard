import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const id = params.id;

  try {
    await connectToMongoDB();
    const customer = await Customer.findOne({ user: id }).populate("user");

    // console.log('received request for customer with id:', id);
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

export async function PUT(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const id = params.id;
    const updates = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: `Invalid customer ID format: ${id}` },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      updates,
      {
        new: true,
      }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error); 
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update customer", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;

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
