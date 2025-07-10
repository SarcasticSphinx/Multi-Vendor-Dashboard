import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
    },
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotionsAndDeals: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
      wishlistUpdates: { type: Boolean, default: true },
    },
    addresses: [
      {
        type: { type: String, enum: ["Home", "Work", "Other"] },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    cartProducts: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    recent_activities: [
      {
        title: { type: String, required: true },
        description: { type: String },
        time: { type: Date, default: Date.now },
      },
    ],
    coupons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
