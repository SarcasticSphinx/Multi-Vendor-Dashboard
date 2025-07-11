import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>;

export async function POST(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const quantity = parseInt(searchParams.get("quantity") || "1");

    // await axiosInstance.patch(`/customer/update-customer-cart/${session?.user.id}?productId=${product._id}&quantity=${quantity}`);

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      {
        $push: {
          cartProducts: {
            productId: new mongoose.Types.ObjectId(productId),
            quantity: quantity,
          },
        },
      },
      { new: true }
    );

    // console.log(updatedCustomer, "updatedCustomer");

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error in PATCH /add-to-cart route:", error);
    return NextResponse.json(
      { message: "Failed to update customer", error },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;

    const { productId, quantity } = await req.json();

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing quantity in request body. Quantity must be a non-negative number.",
        },
        { status: 400 }
      );
    }

    let updatedCustomer;

    if (quantity === 0) {
      updatedCustomer = await Customer.findOneAndUpdate(
        { user: new mongoose.Types.ObjectId(id) },
        {
          $pull: {
            cartProducts: { productId: new mongoose.Types.ObjectId(productId) },
          },
        },
        { new: true }
      );
    } else {
      updatedCustomer = await Customer.findOneAndUpdate(
        {
          user: new mongoose.Types.ObjectId(id),
          "cartProducts.productId": new mongoose.Types.ObjectId(productId),
        },
        {
          $set: {
            "cartProducts.$.quantity": quantity,
          },
        },
        { new: true }
      );
    }
    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer not found or product not in cart" },
        { status: 404 }
      );
    }

    const populatedCustomer = await Customer.findById(updatedCustomer._id)
      .populate({
        path: "cartProducts.productId",
        model: "Product", 
        populate: {
          path: "sellerId",
          model: "Seller", 
        },
      })
      .exec();

    if (!populatedCustomer) {
      return NextResponse.json(
        { error: "Failed to retrieve populated customer data after update" },
        { status: 500 }
      );
    }

    return NextResponse.json(populatedCustomer.cartProducts);
  } catch (error) {
    console.error("Error in PUT /customer/update-cart-item route:", error);
    return NextResponse.json(
      {
        message: "Failed to update cart item",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      {
        $pull: {
          cartProducts: {
            productId: new mongoose.Types.ObjectId(productId),
          },
        },
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error in DELETE /customer/remove-from-cart route:", error);
    return NextResponse.json(
      { message: "Failed to remove product from cart", error },
      { status: 500 }
    );
  }
}
