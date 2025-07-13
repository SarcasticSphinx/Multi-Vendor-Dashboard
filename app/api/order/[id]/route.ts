import { connectToMongoDB } from "@/lib/mongoose";
import Order from "@/models/Order.model";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const { id } = params;

  try {
    await connectToMongoDB();

    const order = await Order.findById(id);

    return NextResponse.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to fetch the order of user id: ${id}`,
        details: message,
      },
      { status: 500 }
    );
  }
}
