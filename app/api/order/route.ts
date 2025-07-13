import { connectToMongoDB } from "@/lib/mongoose";
import Order from "@/models/Order.model";
// import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const formData = await req.json();
    const createdOrder = await Order.create(formData);

    return NextResponse.json(createdOrder);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     await connectToMongoDB();
//     const { searchParams } = new URL(req.url);

//     const sellerIdParam = searchParams.get("sellerId");
//     const idsParam = searchParams.get("ids");

//     const query: {
//       sellerId?: mongoose.Types.ObjectId;
//       _id?: { $in: mongoose.Types.ObjectId[] };
//     } = {};

//     if (sellerIdParam && mongoose.Types.ObjectId.isValid(sellerIdParam)) {
//       query.sellerId = new mongoose.Types.ObjectId(sellerIdParam);
//     } else if (sellerIdParam) {
//       return NextResponse.json(
//         { message: `Invalid sellerId format: ${sellerIdParam}` },
//         { status: 400 }
//       );
//     }

//     if (idsParam) {
//       const idStrings = idsParam.split(",");
//       const validObjectIds: mongoose.Types.ObjectId[] = [];

//       idStrings.forEach((idStr) => {
//         if (mongoose.Types.ObjectId.isValid(idStr)) {
//           validObjectIds.push(new mongoose.Types.ObjectId(idStr));
//         }
//       });

//       if (validObjectIds.length > 0) {
//         query._id = { $in: validObjectIds };
//       } else if (idStrings.length > 0) {
//         return NextResponse.json(
//           { message: "No valid product IDs provided in 'ids' parameter." },
//           { status: 400 }
//         );
//       }
//     }

//     const orders = await Order.find(query);

//     if (orders.length === 0) {
//       return NextResponse.json({ products: [] }, { status: 200 });
//     }

//     return NextResponse.json({ orders: orders }, { status: 200 });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "Unknown server error";
//     console.error("Error fetching products:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch products", details: message },
//       { status: 500 }
//     );
//   }
// }


