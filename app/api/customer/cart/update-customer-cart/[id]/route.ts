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

    // Validate customerId from path parameter
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: `Invalid customer ID format: ${id}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const singleProductId = searchParams.get("productId"); // Query for single product
    const multipleProductIdsParam = searchParams.get("ids"); // Query for multiple products

    let updateOperation
    let returnUpdatedProducts = false; 

    if (multipleProductIdsParam) {
      // --- Case 1: Handle multiple product IDs deletion ---
      const idStrings = multipleProductIdsParam.split(",");
      const validProductObjectIds: mongoose.Types.ObjectId[] = [];

      idStrings.forEach((idStr) => {
        if (mongoose.Types.ObjectId.isValid(idStr)) {
          validProductObjectIds.push(new mongoose.Types.ObjectId(idStr));
        }
      });

      if (validProductObjectIds.length === 0 && idStrings.length > 0) {
        return NextResponse.json(
          { message: "No valid product IDs provided for deletion." },
          { status: 400 }
        );
      }

      // Use $pull with $in to remove multiple items from an array of objects
      updateOperation = {
        $pull: {
          cartProducts: {
            productId: { $in: validProductObjectIds },
          },
        },
      };
      // For this case, we *do not* return the updated products
      returnUpdatedProducts = false;
    } else if (singleProductId) {
      // --- Case 2: Handle single product ID deletion ---
      if (!mongoose.Types.ObjectId.isValid(singleProductId)) {
        return NextResponse.json(
          { message: `Invalid productId format: ${singleProductId}` },
          { status: 400 }
        );
      }

      // Use $pull to remove a single element from an array of objects
      updateOperation = {
        $pull: {
          cartProducts: {
            productId: new mongoose.Types.ObjectId(singleProductId),
          },
        },
      };
      // For this case, we *do* return the updated products
      returnUpdatedProducts = true;
    } else {
      // Neither 'productId' nor 'ids' query parameter was provided
      return NextResponse.json(
        {
          message: "Missing 'productId' or 'ids' query parameter for deletion.",
        },
        { status: 400 }
      );
    }

    // Perform the update operation on the customer's cart
    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) }, // Finds the customer by their associated user ID
      updateOperation,
      { new: true } // Return the updated document
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    if (returnUpdatedProducts) {
      return NextResponse.json(
        { products: updatedCustomer.cartProducts },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Products successfully removed from cart." },
        { status: 200 } 
      );
    }
  } catch (error) {
    console.error(
      "Error in DELETE /cart/update-customer-cart/[id] route:",
      error
    );
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { message: "Failed to remove product(s) from cart", details: message },
      { status: 500 }
    );
  }
}
