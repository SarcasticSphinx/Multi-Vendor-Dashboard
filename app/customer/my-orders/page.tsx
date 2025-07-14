"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  MoreHorizontal,
  RotateCcw,
  MapPin,
  X,
  Package,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";

interface Pricing {
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  currency: string;
}

interface Order {
  _id: string;
  orderId?: string;
  createdAt: string;
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "partially_shipped"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "dispute";
  pricing: Pricing;
  orderDate: string;
  shipping: { shippingMethod: string; shippingCost: number };
  updatedAt: string;
}

const MyOrdersPage: React.FC = () => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        if (!session?.user?.id) {
          // More robust check
          setLoading(false); // Ensure loading is turned off if no session
          return;
        }
        const response = await axiosInstance.get(
          `/customer/order/${session.user.id}` // Use session.user.id directly
        );
        console.log(response.data.orders, "Fetched customer orders");
        setCustomerOrders(response.data.orders);
      } catch (error) {
        console.error("Failed to fetch customer orders:", error); // Use console.error for errors
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, [session?.user?.id]);

  console.log(customerOrders, "Customer Orders State"); // Updated log to differentiate

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBuyAgain = (orderId: string): void => {
    console.log("Buy again:", orderId);
    // Implement actual "Buy Again" logic, e.g., redirect to product page or add to cart
  };

  const handleTrack = (orderId: string): void => {
    console.log("Track order:", orderId);
    // Implement actual "Track" logic, e.g., redirect to tracking page
  };

  const handleCancel = (orderId: string): void => {
    console.log("Cancel order:", orderId);
    // Implement actual "Cancel" logic, e.g., API call to cancel order
  };

  const handleReorder = (orderId: string): void => {
    console.log("Reorder:", orderId);
    // Implement actual "Reorder" logic
  };

  const filteredOrders = customerOrders.filter((order) => {
    // Use order._id as the ID for display and search
    const orderDisplayId = order.orderId || ""; // Provide a default empty string if _id is missing
    const orderStatus = order.orderStatus || ""; // Provide a default empty string if orderStatus is missing

    const matchesSearch = orderDisplayId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || orderStatus.toLowerCase() === statusFilter; // Apply toLowerCase to orderStatus
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6 ">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm">
          View and manage your order history.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="flex-1 relative bg-white">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="relative py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
            variant="outline"
            className="flex items-center justify-between w-48 px-4 py-2"
              >
            {statusFilter === "all"
              ? "Order Status"
              : getStatusText(statusFilter)}
            <span className="ml-2">
             <ChevronDown />
            </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
            Order Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
            Delivered
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>
            Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
            Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
            Cancelled
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
            Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>
            Confirmed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("partially_shipped")}>
            Partially Shipped
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
            Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("refunded")}>
            Refunded
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("dispute")}>
            Dispute
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
            <div>Order ID</div>
            <div>Date</div>
            <div>Status</div>
            <div>Total</div>
            <div>Actions</div>
            <div></div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.orderId} className="px-6 py-4">
                {" "}
                {/* Use _id for key */}
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Order ID - use _id from backend data */}
                  <div className="text-sm font-medium text-gray-900 whitespace-wrap">
                    #{order.orderId} {/* Display _id directly */}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </div>

                  {/* Status - null-safe access */}
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.orderStatus || ""
                      )}`}
                    >
                      {getStatusText(order.orderStatus || "Unknown")}
                    </span>
                  </div>

                  {/* Total - use pricing.total and null-safe */}
                  <div className="text-sm font-medium text-gray-900">
                    ${(order.pricing?.total ?? 0).toFixed(2)}
                  </div>

                  {/* Actions - null-safe access */}
                  <div className="flex items-center gap-2">
                    {/* Ensure order.orderStatus is not null/undefined before comparison */}
                    {order.orderStatus === "pending" && (
                      <Button
                        onClick={() => handleBuyAgain(order._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <CreditCard size={14} />
                        pay now
                      </Button>
                    )}
                    {order.orderStatus === "delivered" && (
                      <Button
                        onClick={() => handleBuyAgain(order._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <RotateCcw size={14} />
                        Buy Again
                      </Button>
                    )}
                    {order.orderStatus === "shipped" && (
                      <Button
                        onClick={() => handleTrack(order._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <MapPin size={14} />
                        Track
                      </Button>
                    )}
                    {order.orderStatus === "processing" && (
                      <Button
                        onClick={() => handleCancel(order._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <X size={14} />
                        Cancel
                      </Button>
                    )}
                    {order.orderStatus === "cancelled" && (
                      <Button
                        onClick={() => handleReorder(order._id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Package size={14} />
                        Reorder
                      </Button>
                    )}
                  </div>

                  {/* More Options */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleCancel(order._id)}
                          className="text-red-600"
                        >
                          Discard Order
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => console.log("Update order:", order._id)}
                        >
                          Update Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
