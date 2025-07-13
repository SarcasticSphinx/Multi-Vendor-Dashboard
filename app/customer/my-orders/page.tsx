"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, MoreHorizontal, RotateCcw, MapPin, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";

interface Pricing {
  total: number;
}

interface Order {
  orderId: string;
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
  total: Pricing;
}

const MyOrdersPage: React.FC = () => {
  const { data: session } = useSession();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCustomerOrders = async (): Promise<void> => {
      try {
        setLoading(true);
        if (!session?.user.id) return;
        const response = await axiosInstance.get(
          `/customer/order/${session?.user.id}`
        );
        setCustomerOrders(response.data.orders);
      } catch (error) {
        console.log("Failed to fetch customer orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerOrders();
  }, [session?.user?.id]);

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
  };

  const handleTrack = (orderId: string): void => {
    console.log("Track order:", orderId);
  };

  const handleCancel = (orderId: string): void => {
    console.log("Cancel order:", orderId);
  };

  const handleReorder = (orderId: string): void => {
    console.log("Reorder:", orderId);
  };

  const filteredOrders = customerOrders.filter((order) => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <style jsx>{`
        :root {
          --secondary: #dc2626;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm">View and manage your order history.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by order id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Order Status</option>
            <option value="delivered">Delivered</option>
            <option value="shipped">Shipped</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
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
          {filteredOrders.map((order) => (
            <div key={order.orderId} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                {/* Order ID */}
                <div className="text-sm font-medium text-gray-900">
                  #{order.orderId}
                </div>

                {/* Date */}
                <div className="text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>

                {/* Total */}
                <div className="text-sm font-medium text-gray-900">
                  ${order.total.total.toFixed(2)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {order.orderStatus === "delivered" && (
                    <Button
                      onClick={() => handleBuyAgain(order.orderId)}
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
                      onClick={() => handleTrack(order.orderId)}
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
                      onClick={() => handleCancel(order.orderId)}
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
                      onClick={() => handleReorder(order.orderId)}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8"
                  >
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;