"use client";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2, ArrowRight, Tag, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

interface Seller {
  _id: string;
  storeName: string;
}

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
  sellerId: Seller;
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
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    const fetchCustomerCart = async () => {
      try {
        setLoading(true);
        if (!session?.user.id) return;
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

  // Group cart items by seller
  const groupedCart = customerCart.reduce<Record<string, CartProduct[]>>((acc, item) => {
    const sellerName = item.productId.sellerId.storeName;
    if (!acc[sellerName]) acc[sellerName] = [];
    acc[sellerName].push(item);
    return acc;
  }, {});

  const updateCartItem = async (itemId: string, newQuantity: number) => {
    try {
      setUpdating(true);
      const response = await axiosInstance.put(`/customer/update-cart-item`, {
        userId: session?.user.id,
        cartItemId: itemId,
        quantity: newQuantity,
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
      const response = await axiosInstance.delete(
        `/customer/remove-cart-item`,
        {
          data: {
            userId: session?.user.id,
            cartItemId: itemId,
          },
        }
      );
      setCustomerCart(response.data.cartProducts);
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    } catch (error) {
      console.error("Error removing cart item:", error);
    } finally {
      setUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return customerCart.reduce((total, item) => {
      const price = item.productId.salePrice || item.productId.price;
      return total + price * item.quantity;
    }, 0);
  };

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(customerCart.map((item) => item._id));
    }
    setSelectedAll(!selectedAll);
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  useEffect(() => {
    setSelectedAll(selectedItems.length === customerCart.length && customerCart.length > 0);
  }, [selectedItems, customerCart.length]);

  const handleDeleteSelected = async () => {
    for (const itemId of selectedItems) {
      await removeCartItem(itemId);
    }
    setSelectedItems([]);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-6 py-8">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-1">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mb-4">
          You have {customerCart.length} items in your cart.
        </p>

        {/* Select All and Delete */}
        <div className="flex justify-between items-center mb-4 px-4 py-3 bg-white rounded border">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedAll}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">
              Select All ({customerCart.length} items)
            </span>
          </div>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedItems.length === 0}
            className={`text-sm flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed `}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>

        {customerCart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl font-medium text-gray-500 mb-4">
              Your cart is empty
            </div>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedCart).map(([sellerName, items]) => (
              <div key={sellerName} className="bg-white rounded border mb-4">
                <div className="flex items-center px-4 pt-4 pb-2 border-b">
                  <input
                    type="checkbox"
                    checked={items.every((item) => selectedItems.includes(item._id))}
                    onChange={() => {
                      const allSelected = items.every((item) => selectedItems.includes(item._id));
                      setSelectedItems((prev) =>
                        allSelected
                          ? prev.filter((id) => !items.map((i) => i._id).includes(id))
                          : [...prev, ...items.map((i) => i._id).filter((id) => !prev.includes(id))]
                      );
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-500 flex items-center gap-2">
                    <Store className="h-4 w-4 " />
                    {sellerName}
                  </span>
                </div>
                {items.map((item) => {
                  const product = item.productId;
                  const currentPrice = product.salePrice || product.price;
                  return (
                    <div key={item._id} className="flex items-center px-4 py-4 border-b last:border-b-0">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="h-4 w-4 mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4">
                        <Image
                          src={product.productImages[0] || "/placeholder.jpg"}
                          alt={product.productTitle}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base leading-tight">
                          {product.productTitle}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {product.colour} | {product.model} Edition
                        </div>
                        <div className="font-bold text-lg">${currentPrice.toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          className="w-7 h-7 rounded border flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          disabled={item.quantity <= 1 || updating}
                          onClick={() => updateCartItem(item._id, item.quantity - 1)}
                        >
                          –
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          className="w-7 h-7 rounded border flex items-center justify-center text-gray-500 hover:bg-gray-100"
                          disabled={updating}
                          onClick={() => updateCartItem(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="ml-4 text-red-500 hover:text-red-700"
                        onClick={() => removeCartItem(item._id)}
                        disabled={updating}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[350px]">
        <div className="bg-white rounded border p-6">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="text-sm">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Shipping</span>
              <span className="text-sm">$0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tax</span>
              <span className="text-sm">$0.0</span>
            </div>
            <div className="pt-4 border-t mt-4">
              <div className="flex mb-4">
                <span className="flex items-center px-2 bg-gray-100 border border-r-0 rounded-l">
                  <Tag className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Enter a promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border-t border-b border-gray-300 text-sm focus:outline-none w-full"
                  style={{ borderLeft: "none", borderRadius: 0 }}
                />
                <Button className="rounded-l-none rounded-r text-sm px-5 bg-secondary hover:bg-secondary/80 text-white">
                  Apply
                </Button>
              </div>
            </div>
            <div className="flex justify-between font-bold pt-4 border-t">
              <span>Total</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full bg-secondary hover:bg-secondary/80 text-white mb-2 rounded-sm">
            Proceed to Checkout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyCart;
