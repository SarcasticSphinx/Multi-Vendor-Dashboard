"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import uploadToCloudinary from "@/lib/cloudinary";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

interface ProductForm {
  productTitle: string;
  description: string;
  productImages: string[];
  category: string;
  brand: string;
  model: string;
  storage: string;
  ram: string;
  colour: string;
  condition: string;
  features: string[];
  price: string;
  salePrice: string;
  quantity: string;
  sku: string;
  enableNegotiation: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  sellerId: string;
}

const AddProductPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSellerId = async () => {
      if (!session?.user.id) return;
      try {
        const response = await axiosInstance.get(`/seller/${session?.user.id}`);

        setFormData((prev) => ({
          ...prev,
          sellerId: response.data._id,
        }));
      } catch (error) {
        console.error("Failed to fetch seller ID:", error);
      }
    };
    fetchSellerId();
  }, [session?.user.id]);

  // console.log(sellerId);

  const [formData, setFormData] = useState<ProductForm>({
    productTitle: "",
    description: "",
    productImages: [],
    category: "",
    brand: "",
    model: "",
    storage: "",
    ram: "",
    colour: "",
    condition: "",
    features: [],
    price: "",
    salePrice: "",
    quantity: "",
    sku: "",
    enableNegotiation: false,
    tags: [],
    seoTitle: "",
    seoDescription: "",
    sellerId: '',
  });

  console.log(formData.sellerId);

  const [dragActive, setDragActive] = useState(false);

  const categories = [
    "Mobile Phones",
    "Laptops",
    "Tablets",
    "Headphones",
    "Accessories",
    "Smart Watches",
  ];

  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
  const ramOptions = ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"];
  const colourOptions = [
    "Black",
    "White",
    "Blue",
    "Red",
    "Green",
    "Gold",
    "Silver",
    "Purple",
  ];
  const conditionOptions = [
    "New",
    "Open Box",
    "Refurbished",
    "Very Good",
    "Good",
    "Fair",
    "Defective",
  ];
  const featureOptions = [
    "5G",
    "Wireless Charging",
    "Face ID",
    "Fingerprint",
    "Water Resistant",
    "Fast Charging",
  ];

  const handleInputChange = (
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop logic here
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToCloudinary(file);
      // console.log(url)
      if (url) {
        setFormData((prev) => ({
          ...prev,
          productImages: [...prev.productImages, url],
        }));
      }
      console.log(formData.productImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/products", {
        ...formData,
      });
      router.push("/seller/products");
      toast.success("Product submitted successfully!");
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col mb-6">
          <button
            className="flex items-center text-2xl font-bold hover:text-gray-600 mr-4"
            onClick={router.back}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Add New Product
          </button>

          <p className="text-sm text-gray-600 ml-6">
            Fill in the details to list your product for sale
          </p>
        </div>

        <div className="rounded-lg flex flex-col gap-4">
          {/* General Information */}
          <div className="p-6 border rounded-lg bg-white ">
            <h2 className="text-xl font-semibold mb-4">General Information</h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Type Product Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.productTitle}
                  onChange={(e) =>
                    handleInputChange("productTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Type Product Description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Product Images <span className="text-red-500">*</span>
                </label>
                {formData.productImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {formData.productImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={image}
                          alt={`Product Image ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              productImages: prev.productImages.filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag & drop product images
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse (Max 10MB each)
                  </p>
                  <div className="px-4 py-2 text-black border w-fit  hover:text-white rounded-md hover:bg-secondary transition-colors mx-auto">
                    <input
                      type="file"
                      id="product-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-image"
                      className="cursor-pointer px-4 py-2 rounded-md "
                    >
                      Select Image
                    </label>{" "}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                >
                  <option value="">Mobile Phones</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="p-6 border rounded-lg bg-white ">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <button className="text-blue-600 hover:text-blue-700 flex items-center text-sm">
                <Plus className="w-4 h-4 mr-1" />
                Add another specification
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-md font-medium text-gray-700 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Type model"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Storage <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.storage}
                  onChange={(e) => handleInputChange("storage", e.target.value)}
                >
                  <option value="">Select Storage</option>
                  {storageOptions.map((storage) => (
                    <option key={storage} value={storage}>
                      {storage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  RAM <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.ram}
                  onChange={(e) => handleInputChange("ram", e.target.value)}
                >
                  <option value="">Select RAM</option>
                  {ramOptions.map((ram) => (
                    <option key={ram} value={ram}>
                      {ram}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Colour <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.colour}
                  onChange={(e) => handleInputChange("colour", e.target.value)}
                >
                  <option value="">Select Colour</option>
                  {colourOptions.map((colour) => (
                    <option key={colour} value={colour}>
                      {colour}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {conditionOptions.map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="radio"
                        name="condition"
                        value={condition}
                        checked={formData.condition === condition}
                        onChange={(e) =>
                          handleInputChange("condition", e.target.value)
                        }
                        className="mr-2"
                      />
                      {condition}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Features <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {featureOptions.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-2"
                      />
                      {feature}
                    </label>
                  ))}
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Add another feature
                </button>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="p-6 border rounded-lg bg-white ">
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Sale Price ($)
                </label>
                <input
                  type="number"
                  placeholder="000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.salePrice}
                  onChange={(e) =>
                    handleInputChange("salePrice", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  placeholder="Type SKU"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enableNegotiation}
                  onChange={(e) =>
                    handleInputChange("enableNegotiation", e.target.checked)
                  }
                  className="mr-2"
                />
                Enable Negotiation
              </label>
            </div>
          </div>

          {/* Additional Information */}
          <div className="p-6 bg-white border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Additional Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="eg: smartphone, android, ios, flagship, value-oriented"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0),
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  placeholder="Type SEO-friendly title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.seoTitle}
                  onChange={(e) =>
                    handleInputChange("seoTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  placeholder="Custom description for search engines"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.seoDescription}
                  onChange={(e) =>
                    handleInputChange("seoDescription", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t bg-gray-50 flex justify-between">
            <button className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-sm hover:bg-red-600 hover:text-white  transition-colors">
              <Trash2 className="size-5" />
              Discard
            </button>
            <div className="flex items-center gap-4">
              <button className="px-6 py-2 border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
              <button
                className="px-6 py-2 bg-secondary text-white rounded-sm hover:bg-secondary/90 transition-colors"
                onClick={handleSubmit}
              >
                Send for Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
