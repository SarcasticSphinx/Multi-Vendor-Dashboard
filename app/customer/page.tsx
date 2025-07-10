"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/lib/axios";
import Loading from "@/components/Loading";
import Link from "next/link";

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
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  status: "active" | "low stock" | "out of stock";
  sellerId: string;
  createdAt: string;
}

export default function CustomerHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Our Store</h1>
        <p className="text-gray-600">Discover amazing products at great prices</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products available at the moment.</p>
          <Button variant="outline" className="mt-4" onClick={fetchProducts}>
            Refresh
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card 
              key={product._id} 
              className="flex flex-col hover:shadow-lg transition-shadow duration-300 border rounded-lg overflow-hidden gap-0"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1 text-lg font-semibold text-gray-900">
                    {product.productTitle}
                  </CardTitle>
                  {product.isFeatured && (
                    <Badge className="ml-2" variant="default">
                      Featured
                    </Badge>
                  )}
                </div>
                {product.status === "low stock" && (
                  <Badge variant="destructive" className="mt-2 w-fit">
                    Low Stock
                  </Badge>
                )}
                {product.status === "out of stock" && (
                  <Badge variant="outline" className="mt-2 w-fit">
                    Out of Stock
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="flex-grow p-4">
                <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.productImages[0] || "/placeholder.jpg"}
                    alt={product.productTitle}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    aria-label={`Image of ${product.productTitle}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-bold">
                      <span className="font-medium">Brand:</span> {product.brand}
                    </p>
                    <p className="text-sm text-gray-600 font-bold">
                      <span className="font-medium">Condition:</span> {product.condition}
                    </p>
                  </div>
                  
                  
                  <div className="pt-2">
                    {product.salePrice && product.salePrice < product.price ? (
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-green-600">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="ml-auto text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t border-gray-200">
                <Link href={`/products/${product._id}`} className="w-full">
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 transition-colors"
                    aria-label={`View details for ${product.productTitle}`}
                    disabled={product.status === "out of stock"}
                  >
                    {product.status === "out of stock" ? "Out of Stock" : "View Details"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}