import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    storeDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
        required: true,
      },
      socialMedia: {
        website: { type: String, trim: true },
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        linkedin: { type: String, trim: true },
      },
    },

    businessAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      routingNumber: { type: String, trim: true },
      accountType: {
        type: String,
        enum: ["Checking", "Savings"],
        default: "Checking",
      },
    },
    paymentMethods: {
      bkash: { type: String, trim: true },
      nagad: { type: String, trim: true },
      bankTransfer: { type: Boolean, default: false },
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "banned"],
      default: "inactive",
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
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
    stats: {
      ratings: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    reviews: [
      {
        customerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
          required: true,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: true,
        },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, trim: true },
        reviewDate: { type: Date, default: Date.now },
      },
    ],
    salesMetrics: {
      totalSales: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      monthlyRevenue: [
        {
          month: { type: String, required: true }, // "2024-01"
          revenue: { type: Number, default: 0 },
          orders: { type: Number, default: 0 },
        },
      ],
    },
    notificationPreferences: {
      orderNotifications: { type: Boolean, default: true },
      paymentNotifications: { type: Boolean, default: true },
      reviewNotifications: { type: Boolean, default: true },
      marketingUpdates: { type: Boolean, default: false },
      systemUpdates: { type: Boolean, default: true },
    },
    businessCategories: [
      {
        type: String,
        enum: [
          "Electronics",
          "Clothing",
          "Home & Garden",
          "Sports & Recreation",
          "Books & Media",
          "Health & Beauty",
          "Automotive",
          "Food & Beverages",
          "Art & Crafts",
          "Other",
        ],
      },
    ],
    inventory: {
      totalProducts: { type: Number, default: 0 },
      activeProducts: { type: Number, default: 0 },
      lowStockProducts: { type: Number, default: 0 },
      outOfStockProducts: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;
