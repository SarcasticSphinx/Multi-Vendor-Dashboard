"use client";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

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
}

interface CartProduct {
  productId: Product;
  quantity: number;
  addedAt: string;
  _id: string;
}

const MyCart = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [customerCart, setCustomerCart] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCustomerCart = async () => {
      try {
        setLoading(true);
        if (!session?.user.id) {
          console.error("User ID is not available in session");
          return;
        }
        const response = await axiosInstance.get(
          `/customer/fetch-by-userId/${session?.user.id}`
        );
        setCustomerCart(response.data.cartProducts);
      } catch (error) {
        console.log("Failed to fetch customer cart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerCart();
  }, [session?.user?.id]);

  const updateCartItem = async (itemId: string, newQuantity: number) => {
    try {
      setUpdating(true);
      const response = await axiosInstance.put(`/customer/update-cart-item`, {
        userId: session?.user.id,
        cartItemId: itemId,
        quantity: newQuantity
      });
      setCustomerCart(response.data.cartProducts);
    } catch (error) {
      console.error("Error updating cart item:", error);
    } finally {
      setUpdating(false);
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      setUpdating(true);
      const response = await axiosInstance.delete(`/customer/remove-cart-item`, {
        data: {
          userId: session?.user.id,
          cartItemId: itemId
        }
      });
      setCustomerCart(response.data.cartProducts);
    } catch (error) {
      console.error("Error removing cart item:", error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return customerCart.reduce((total, item) => {
      const price = item.productId.salePrice || item.productId.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateSavings = () => {
    return customerCart.reduce((total, item) => {
      if (item.productId.salePrice) {
        return total + ((item.productId.price - item.productId.salePrice) * item.quantity);
      }
      return total;
    }, 0);
  };

  if (loading) {
    return <Loading/>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Your Shopping Cart</h1>
      <p className="text-sm text-gray-600 mb-6">You have {customerCart.length} items in your cart</p>
      
      {customerCart.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl font-medium text-gray-500 mb-4">Your cart is empty</div>
          <Button onClick={() => router.push('/')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {customerCart.map((item) => {
                const product = item.productId;
                const currentPrice = product.salePrice || product.price;
                const originalPrice = product.salePrice ? product.price : null;

                return (
                  <div key={item._id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={product.productImages[0] || "/placeholder.jpg"}
                        alt={product.productTitle}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Link href={`/products/${product._id}`} className="hover:underline">
                          <h3 className="font-medium text-lg">{product.productTitle}</h3>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeCartItem(item._id)}
                          disabled={updating}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">{product.brand} • {product.model}</p>
                      
                      {product.status === "low stock" && (
                        <Badge variant="destructive" className="mb-2">Low Stock</Badge>
                      )}
                      {product.status === "out of stock" && (
                        <Badge variant="destructive" className="mb-2">Out of Stock</Badge>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        <span className="font-bold">${currentPrice.toFixed(2)}</span>
                        {originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1 || updating}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateCartItem(item._id, item.quantity + 1)}
                          disabled={item.quantity >= product.quantity || updating}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              {calculateSavings() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Savings</span>
                  <span>-${calculateSavings().toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-4 border-t">
                <span>Total</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full bg-secondary mb-4" size="lg">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCart;