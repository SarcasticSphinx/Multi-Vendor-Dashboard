"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Store, ShoppingCart } from "lucide-react";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

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

interface GroupedWishlist {
  [sellerName: string]: Product[];
}

const Wishlist: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  // const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerWishlist, setCustomerWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  // const [selectedAll, setSelectedAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchCustomerWishlist = async (): Promise<void> => {
      try {
        setLoading(true);
        if (!session?.user.id) return;
        const response = await axiosInstance.get(
          `/customer/wishlist/${session?.user.id}`
        );
        setCustomerWishlist(response.data.wishlist);
        // setCustomerId(response.data.customerId);
      } catch (error) {
        console.log("Failed to fetch customer wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerWishlist();
  }, [session?.user?.id]);

  const groupedWishlist: GroupedWishlist =
    customerWishlist.reduce<GroupedWishlist>((acc, item) => {
      const sellerName = item.sellerId.storeName || "Unknown Seller";
      if (!acc[sellerName]) acc[sellerName] = [];
      acc[sellerName].push(item);
      return acc;
    }, {});

  const removeWishlistItem = async (itemId: string): Promise<void> => {
    try {
      setUpdating(true);
      const response = await axiosInstance.delete(
        `/customer/wishlist/update-customer-wishlist/${session?.user.id}?productId=${itemId}`
      );
      setCustomerWishlist(response.data.wishlist);
      setSelectedItems((prev) => prev.filter((item) => item !== itemId));
    } catch (error) {
      console.error("Error removing wishlist item:", error);
    } finally {
      setUpdating(false);
    }
  };

  const addToCart = async (productId: string): Promise<void> => {
    if (!productId) return;
    try {
      const quantity = 1; 
      await axiosInstance.post(
        `/customer/cart/update-customer-cart/${session?.user.id}?productId=${productId}&quantity=${quantity}`
      );
      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  const addAllToCart = async (): Promise<void> => {
    try {
      setUpdating(true);
      for (const item of customerWishlist) {
        await addToCart(item._id);
      }
    } catch (error) {
      console.error("Error adding all items to cart:", error);
    } finally {
      setUpdating(false);
    }
  };

  // const handleSelectAll = (): void => {
  //   if (selectedAll) {
  //     setSelectedItems([]);
  //   } else {
  //     setSelectedItems(customerWishlist.map((item) => item._id));
  //   }
  //   setSelectedAll(!selectedAll);
  // };

  const handleSelectItem = (productId: string): void => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((item) => item === productId);

      if (existingIndex !== -1) {
        // Item is already selected, remove it
        return prev.filter((item) => item !== productId);
      } else {
        // Item is not selected, add it
        return [...prev, productId];
      }
    });
  };

  const isItemSelected = (productId: string): boolean => {
    return selectedItems.includes(productId);
  };

  const handleSellerCheckboxChange = (sellerProducts: Product[]): void => {
    const sellerProductIds = sellerProducts.map((product) => product._id);
    const allSelected = sellerProductIds.every((id) => isItemSelected(id));

    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !sellerProductIds.includes(id))
      );
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...sellerProductIds])]);
    }
  };

  const isSellerSelected = (sellerProducts: Product[]): boolean => {
    return sellerProducts.every((product) => isItemSelected(product._id));
  };

  // useEffect(() => {
  //   setSelectedAll(
  //     selectedItems.length === customerWishlist.length &&
  //       customerWishlist.length > 0
  //   );
  // }, [selectedItems, customerWishlist.length]);

  // const handleDeleteSelected = async (): Promise<void> => {
  //   for (const itemId of selectedItems) {
  //     await removeWishlistItem(itemId);
  //   }
  //   setSelectedItems([]);
  // };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className=" p-6 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wishlist</h1>
          <p className="text-gray-500 text-sm">
            Manage your saved items across multiple wishlists
          </p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-medium">
          <Plus size={16} />
          Create New List
        </Button>
      </div>

      {/* Add All To Cart Button */}
      <div className="mb-6">
        <Button
          onClick={addAllToCart}
          disabled={updating || customerWishlist.length === 0}
          variant="outline"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm font-medium border border-gray-300 px-4 py-2 rounded-sm hover:bg-gray-50"
        >
          <Plus size={16} />
          Add All To Cart
        </Button>
      </div>

      {/* Wishlist Items */}
      {Object.keys(groupedWishlist).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your wishlist is empty</p>
          <Button
            onClick={() => router.push("/customer")}
            className="bg-secondary text-white font-medium"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedWishlist).map(
            ([sellerName, products], sellerIndex) => (
              <div
                key={sellerIndex}
                className="border border-gray-200 rounded-lg"
              >
                {/* Seller Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSellerSelected(products)}
                    onChange={() => handleSellerCheckboxChange(products)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Store size={16} className="text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    {sellerName}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {products.map((item: Product) => (
                    <div key={item._id} className="p-4 flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isItemSelected(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />

                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 relative">
                        <Image
                          src={
                            item.productImages[0] || "/placeholder-product.jpg"
                          }
                          alt={item.productTitle}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {item.productTitle}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {item.colour} | {item.condition}
                        </p>
                        <p className="text-gray-900 font-semibold text-sm mt-2">
                          ${item.salePrice || item.price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => removeWishlistItem(item._id)}
                          disabled={updating}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                        <Button
                          onClick={() => addToCart(item._id)}
                          disabled={updating}
                          className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-sm text-sm font-medium flex items-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
