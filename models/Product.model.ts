import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // General Information
    productTitle: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Product title must be at least 3 characters long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    productImages: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    // Specifications
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    storage: {
      type: String,
      required: [true, "Storage is required"],
      trim: true,
      enum: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    },
    colour: {
      type: String,
      required: [true, "Colour is required"],
      trim: true,
    },
    ram: {
      type: String,
      required: [true, "RAM is required"],
      trim: true,
      enum: ["4GB", "6GB", "8GB", "12GB", "16GB"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
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
      default: "New",
    },
    features: [
      {
        type: String,
        trim: true,
        enum: [
          "5G",
          "Wireless Charging",
          "Face ID",
          "Fingerprint",
          "Water Resistant",
          "NFC",
          "Fast Charging",
        ],
      },
    ],

    // Pricing & Inventory
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      //   validate: {
      //     validator: function (v) {
      //     //   Sale price should be less than or equal to the regular price
      //       return v <= this.price;
      //     },
      //     message: (props) =>
      //       `Sale price (${props.value}) must be less than or equal to the regular price (${props.path})`,
      //   },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "SKU is required"],
    },
    enableNegotiation: {
      type: Boolean,
      default: false,
    },

    // Additional Information
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [70, "SEO Title cannot be more than 70 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO Description cannot be more than 160 characters"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "low stock", "out of stock"],
      default: "active",
    },

    // Vendor Information
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
