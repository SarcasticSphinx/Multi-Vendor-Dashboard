"use client";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Star,
  Heart,
  Share2,
  ChevronRight,
  Shield,
  Truck,
  CreditCard,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  productTitle: string;
  description: string;
  productImages: string[];
  category: string;
  brand: string;
  model: string;
  storage: string;
  colour: string;
  ram: string;
  condition: string;
  features: string[];
  price: number;
  salePrice?: number;
  quantity: number;
  sku: string;
  enableNegotiation: boolean;
  tags: string[];
  isFeatured: boolean;
  status: "active" | "low stock" | "out of stock";
  sellerId: string;
  createdAt: string;
}

const ProductDetailPage = (props: { params: Promise<{ id: string }> }) => {
  const { data: session } = useSession();
  // console.log(session, "session");
  const { id } = use(props.params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (!id) return;
      try {
        const response = await axiosInstance.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  // console.log(session?.user?.id, "session user id");
  

  async function handleAddToCart() {
    if (!product) return;
    try {
      await axiosInstance.patch(
        `/customer/add-to-cart/${session?.user.id}?productId=${product._id}&quantity=${quantity}`
      );
      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    }
  }

  async function handleAddToWishlist() {
    if (!product) return;
    try {
      await axiosInstance.patch(
        `/customer/add-to-wishlist/${session?.user.id}?productId=${product._id}&quantity=${quantity}`
      );
      toast.success("Product added to wishlist successfully!");
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      toast.error("Failed to add product to wishlist");
    }
  }

  if (loading || !product) {
    return <Loading />;
  }

  const discountPercentage = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <span>Home</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span>{product.category}</span>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-gray-900 font-medium">{product.brand}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square w-full rounded-lg bg-gray-100 overflow-hidden">
            <Image
              src={product.productImages[selectedImage] || "/placeholder.jpg"}
              alt={product.productTitle}
              fill
              className="object-contain"
              priority
            />
            {product.isFeatured && (
              <Badge className="absolute top-4 left-4 z-10">Featured</Badge>
            )}
          </div>

          {/* Thumbnail Carousel */}
          {product.productImages.length > 1 && (
            <Carousel className="w-full">
              <CarouselContent>
                {product.productImages.map((img, index) => (
                  <CarouselItem key={index} className="basis-1/4">
                    <div
                      className={`relative aspect-square rounded-md cursor-pointer border-2 ${
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={img}
                        alt={`${product.productTitle} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {product.productTitle}
            </h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">(24 reviews)</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <div className="flex items-center">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through ml-2">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="ml-3 bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded-full">
                    {discountPercentage}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>
            {product.enableNegotiation && (
              <p className="text-sm text-green-600 mt-1">Price negotiable</p>
            )}
          </div>

          {/* Status & Quantity */}
          <div className="mb-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Status:</p>
              {product.status === "active" && (
                <Badge variant="outline" className="text-green-600">
                  In Stock
                </Badge>
              )}
              {product.status === "low stock" && (
                <Badge variant="destructive">
                  Low Stock ({product.quantity} left)
                </Badge>
              )}
              {product.status === "out of stock" && (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {product.status !== "out of stock" && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Quantity:
                </p>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="px-4">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={product.status === "out of stock"}
            >
              {product.status === "out of stock"
                ? "Out of Stock"
                : "Add to Cart"}
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              Buy Now
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="p-2"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="p-2">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="text-sm font-medium">{product.brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Model</p>
                <p className="text-sm font-medium">{product.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Storage</p>
                <p className="text-sm font-medium">{product.storage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RAM</p>
                <p className="text-sm font-medium">{product.ram}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="text-sm font-medium">{product.colour}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="text-sm font-medium">{product.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="text-sm font-medium">{product.sku}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Features
              </h2>
              <ul className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Shipping Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">1 Year Warranty</p>
                <p className="text-xs text-gray-500">For all products</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <CreditCard className="h-6 w-6 text-primary mb-2" />
                <p className="text-xs font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
