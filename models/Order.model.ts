import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "partially_shipped",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
        "dispute",
      ],
      default: "pending",
    },
    shippingAddress: {
      type: {
        type: String,
        enum: ["Home", "Work", "Other"],
        default: "Home",
      },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      instructions: { type: String },
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingCost: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      taxRate: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponDiscount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, default: "USD" },
    },
    payment: {
      paymentMethod: {
        type: String,
        enum: [
          "credit_card",
          "debit_card",
          "paypal",
          "stripe",
          "bank_transfer",
          "cash_on_delivery",
          "digital_wallet",
        ],
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "cancelled",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      transactionId: { type: String },
      paymentDate: { type: Date },
      paymentProvider: { type: String },
    },
    shipping: {
      shippingMethod: {
        type: String,
        enum: ["standard", "express", "overnight", "pickup"],
        default: "standard",
      },
      shippingCost: { type: Number, default: 0, min: 0 },
      deliveryDate: { type: Date },
      shippingDate: { type: Date },
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
