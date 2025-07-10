"use client";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

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
}

const MyCart = () => {
  const { data: session } = useSession();
  const [customerCart, setCustomerCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    const fetchCustomerCartIds = async () => {
      try {
        if (!session?.user?.id) {
          console.error("User ID is not available in session");
          return;
        }
        const response = await axiosInstance.get(
          `/customer/fetch-by-userId/${session?.user?.id}`
        );
        setCustomerCart(response.data.cartProducts);
      } catch (error) {
        console.log("Failed to fetch customer cart IDs:", error);
      }
    };
    fetchCustomerCartIds();
  }, [session?.user?.id]);
  console.log("Customer Cart Items: ", customerCart);
  return <div>{customerCart.length}</div>;
};

export default MyCart;
