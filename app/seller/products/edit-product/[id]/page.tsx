"use client";
import axiosInstance from "@/lib/axios";
import React, { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  ChevronDown,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Product from "../../../../../models/Product.model";
import Image from "next/image";
import uploadToCloudinary from "@/lib/cloudinary";
import { useSession } from "next-auth/react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Product {
  _id?: string;
  productTitle?: string;
  description?: string;
  productImages?: string[];
  category?: string;
  brand?: string;
  model?: string;
  storage?: string;
  colour?: string;
  ram?: string;
  condition?: string;
  features?: string[];
  price?: number;
  salePrice?: number;
  quantity?: number;
  sku?: string;
  enableNegotiation?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  status?: string;
}

const EditProductPage = ({ params }: PageProps) => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "seller") {
      redirect("/unauthorized");
    }
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [specificationInput, setSpecificationInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isRamOpen, setIsRamOpen] = useState(false);
  const [isColourOpen, setIsColourOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);

  // Options for dropdowns
  const categories = [
    "Mobile Phones",
    "Laptops & Accessories",
    "Wearables",
    "Headphones & Audio",
    "Kitchen & Dining",
  ];
  const brands = ["Samsung", "Apple", "OnePlus", "Xiaomi", "Google", "Sony"];
  const models = [
    "Galaxy S24 Ultra",
    "iPhone 15 Pro",
    "OnePlus 12",
    "Pixel 8 Pro",
  ];
  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const ramOptions = ["4GB", "6GB", "8GB", "12GB", "16GB"];
  const colours = [
    "Titanium Black",
    "Natural Titanium",
    "Blue Titanium",
    "White Titanium",
  ];
  const conditions = [
    "New",
    "Open Box",
    "Used",
    "Refurbished",
    "Very Good",
    "Good",
    "Fair",
    "Defective",
  ];
  const availableFeatures = [
    "5G",
    "Wireless Charging",
    "Face ID",
    "Fingerprint",
    "Water Resistant",
    "NFC",
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error(`Failed to fetch product of id: ${id}`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (field: keyof Product, value: unknown) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadToCloudinary(file);
      // console.log(url)
      if (url) {
        setProduct((prev) => ({
          ...prev,
          productImages: [...(prev.productImages || []), url],
        }));
      }
      console.log(product.productImages);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  };

  const addTag = () => {
    if (tagInput.trim() && !product.tags?.includes(tagInput.trim())) {
      handleInputChange("tags", [...(product.tags || []), tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      product.tags?.filter((tag) => tag !== tagToRemove) || []
    );
  };

  const addSpecification = () => {
    if (specificationInput.trim()) {
      console.log("Add specification:", specificationInput);
      setSpecificationInput("");
    }
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = product.features || [];
    const updatedFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];
    handleInputChange("features", updatedFeatures);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.patch(`/products/${id}`, product);
      router.push("/seller/products");
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    router.back();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Edit Product Details</h1>
          <p className="text-gray-600 text-sm">
            Edit the details of your product
          </p>
        </div>
      </div>

      {/* General Information */}
      <div className="mb-8 rounded-md bg-white p-2">
        <h2 className="text-lg font-medium mb-4">General Information</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={product.productTitle || ""}
              onChange={(e) =>
                handleInputChange("productTitle", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Samsung Galaxy S24 Ultra - 512GB - Titanium Black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={product.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="This is a gently used Samsung smartphone excellent condition. It may show minor cosmetic issues, but functions perfectly. Quickly delivers a lasting value of favorite and desired old products."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Images
            </label>
            <div
              className={`border-2 border-dashed ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              } rounded-sm p-8 text-center`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, index) =>
                  product.productImages &&
                  product.productImages.length > index &&
                  product.productImages[index] ? (
                    <div
                      key={index}
                      className="relative aspect-square rounded-sm overflow-hidden"
                    >
                      <Image
                        fill
                        src={product.productImages[index]}
                        alt={`Product Image ${index + 1}`}
                        className="aspect-square object-cover rounded-sm"
                      />
                      <button className="absolute top-2 right-2 p-2 text-red-600 rounded-full bg-red-200 hover:bg-red-100">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-sm flex flex-col text-gray-500 items-center justify-center bg-gray-50"
                    >
                      <ImagePlus size={24} className="text-gray-400" />
                      Add Image
                    </div>
                  )
                )}
              </div>
              <p className="text-gray-500 text-sm mb-2">
                Upload up to 4 images. Each image will be used on the product
                front page.
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.category || "Mobile Phones"}</span>
                <ChevronDown size={16} />
              </button>
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleInputChange("category", category);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="mb-8 rounded-md bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Specifications</h2>
          <button
            onClick={addSpecification}
            className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
          >
            <Plus size={16} />
            Add another specification
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Brand <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsBrandOpen(!isBrandOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.brand || "Samsung Galaxy"}</span>
                <ChevronDown size={16} />
              </button>
              {isBrandOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        handleInputChange("brand", brand);
                        setIsBrandOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.model || "S24 Ultra"}</span>
                <ChevronDown size={16} />
              </button>
              {isModelOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        handleInputChange("model", model);
                        setIsModelOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Storage <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsStorageOpen(!isStorageOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.storage || "256GB"}</span>
                <ChevronDown size={16} />
              </button>
              {isStorageOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {storageOptions.map((storage) => (
                    <button
                      key={storage}
                      onClick={() => {
                        handleInputChange("storage", storage);
                        setIsStorageOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Colour <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsColourOpen(!isColourOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.colour || "Titanium Black"}</span>
                <ChevronDown size={16} />
              </button>
              {isColourOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {colours.map((colour) => (
                    <button
                      key={colour}
                      onClick={() => {
                        handleInputChange("colour", colour);
                        setIsColourOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {colour}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              RAM <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsRamOpen(!isRamOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.ram || "12GB"}</span>
                <ChevronDown size={16} />
              </button>
              {isRamOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {ramOptions.map((ram) => (
                    <button
                      key={ram}
                      onClick={() => {
                        handleInputChange("ram", ram);
                        setIsRamOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsConditionOpen(!isConditionOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-left bg-white hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{product.condition || "New"}</span>
                <ChevronDown size={16} />
              </button>
              {isConditionOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
                  {conditions.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => {
                        handleInputChange("condition", condition);
                        setIsConditionOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Features</label>
          <div className="grid grid-cols-2 gap-2">
            {availableFeatures.map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={product.features?.includes(feature) || false}
                  onChange={() => toggleFeature(feature)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="mb-8 rounded-md bg-white p-6">
        <h2 className="text-lg font-medium mb-4">Pricing & Inventory</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Price($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={product.price || ""}
              onChange={(e) =>
                handleInputChange("price", Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="899"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sale Price($)
            </label>
            <input
              type="number"
              value={product.salePrice || ""}
              onChange={(e) =>
                handleInputChange("salePrice", Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="799"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={product.quantity || ""}
              onChange={(e) =>
                handleInputChange("quantity", Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <input
              type="text"
              value={product.sku || ""}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. SG-S24-U"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mb-8 rounded-md bg-white p-6">
        <h2 className="text-lg font-medium mb-4">Additional Information</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex sm:flex-row flex-col gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. smartphone, android, 5G, flagship, ultra-premium"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Tags help buyers find your product when they search.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <input
              type="text"
              value={product.seoTitle || ""}
              onChange={(e) => handleInputChange("seoTitle", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buy Samsung Galaxy S24 Ultra - Premium Smartphone with 512GB Storage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              SEO Description
            </label>
            <textarea
              value={product.seoDescription || ""}
              onChange={(e) =>
                handleInputChange("seoDescription", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Shop the Samsung Galaxy S24 Ultra with 256GB storage in Titanium Black. Gently used in excellent condition. Galaxy and more at great prices."
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-2 pt-6 border-t p-6 bg-white">
        <button
          onClick={handleDiscard}
          className="flex flex-1 sm:flex-none items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-sm hover:bg-red-600 hover:text-white  transition-colors"
        >
          <Trash2 className="size-5" />
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 sm:flex-none px-6 py-2 bg-secondary text-white rounded-sm hover:bg-secondary/90 disabled:opacity-50 font-medium"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
};

export default EditProductPage;
