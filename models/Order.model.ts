import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  condition: {
    type: String,
    enum: [
      "New",
      "Open Box",
      "Used",
      "Refurbished",
      "Very Good",
      "Good",
      "Fair",
      "Defective",
    ],
    default: "Used",
  },
  imageUrl: {
    type: String,
    trim: true,
  },
});

// Define a sub-schema for the shipping address
const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    // Or Province/Region
    type: String,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
});

// Define a sub-schema for payment information
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: [
      "Credit Card",
      "Debit Card",
      "PayPal",
      "Bank Transfer",
      "Cash on Delivery",
    ],
    default: "Credit Card",
  },
  // For security, never store full card details. Store last 4 digits and type.
  last4Digits: {
    type: String,
    trim: true,
    match: /^\d{4}$/, // Ensures it's exactly 4 digits
    select: false, // Do not return this field by default in queries
  },
  transactionId: {
    // If applicable from payment gateway
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },
});

// Define a sub-schema for the order timeline
const orderTimelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      "Order Placed",
      "Payment Confirmed",
      "Processed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      // Custom order ID like "Ord-001"
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      // Reference to the User schema (the buyer)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your user schema is named 'User'
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    orderItems: [orderItemSchema], // Array of order item sub-documents
    shippingAddress: {
      type: shippingAddressSchema, // Embedded shipping address document
      required: true,
    },
    paymentInfo: {
      type: paymentInfoSchema, // Embedded payment info document
      required: true,
    },
    totalAmount: {
      // Sum of all item prices * quantities + shipping + tax - discount
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, "Shipping cost cannot be negative"],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, "Tax amount cannot be negative"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    orderStatus: {
      type: String,
      required: true,
      enum: [
        "Pending",
        "Processed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },
    timeline: [orderTimelineEventSchema], // Array of timeline event sub-documents
    notes: {
      // Any additional notes for the order
      type: String,
      trim: true,
    },
    // Timestamps for creation and last update
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Mongoose will automatically add createdAt and updatedAt fields
  }
);


const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
