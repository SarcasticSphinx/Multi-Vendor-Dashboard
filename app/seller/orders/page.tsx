"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";;
import { DialogHeader } from "@/components/ui/dialog";
import { redirect } from "next/navigation";

interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  customer: {
    _id: string;
    firstName: string;
    lastName?: string;
  };
  orderItems: {
    product: {
      productTitle: string;
    };
    quantity: number;
  }[];
  pricing: {
    subtotal: number;
    total: number;
  };
  orderStatus: string;
}

const SellerOrdersPage = () => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "seller") {
      redirect("/unauthorized");
    }
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // console.log("Session Data:", session);
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user.id) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/seller/order/${session?.user.id}`
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session?.user.id]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <Loading />;

  return (
    <div className=" mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold mb-2">Orders</h1>
      </div>
      <div className="relative mb-4 bg-white">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order id or customer name"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="mb-4 w-full"
      >
        <TabsList className="grid grid-cols-4 w-full mb-2 h-full p-1">
          <TabsTrigger className="py-2" value="All">
            All
          </TabsTrigger>
          <TabsTrigger className="py-2" value="pending">
            Pending
          </TabsTrigger>
          <TabsTrigger className="py-2" value="shipped">
            Shipped
          </TabsTrigger>
          <TabsTrigger className="py-2" value="cancelled">
            Cancelled
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {/* Orders Card List (mobile) */}
      <div className="space-y-4 md:hidden">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">Ord-{order.orderId}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(order.orderDate)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                <div>
                  <div className="text-gray-500">Buyer</div>
                  <div className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Amount</div>
                  <div className="font-medium">${order.pricing.total}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus.charAt(0).toUpperCase() +
                      order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>
              <hr className="block sm:hidden" />
              <div className="flex gap-2 mt-2">
                <Link href={`/seller/orders/${order._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </Link>
                {order.orderStatus === "pending" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-1/2 flex items-center justify-center gap-2"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Truck className="w-4 h-4" />
                    Ship Order
                  </Button>
                )}
              </div>
              {/* Dialog for Ship Order */}
              {selectedOrder?.orderId === order.orderId && (
                <Dialog
                  open={true}
                  onOpenChange={() => setSelectedOrder(null)}
                >
                  <DialogContent className="max-w-xs">
                    <DialogHeader>
                      <DialogTitle>
                        Order #{order.orderId}
                      </DialogTitle>
                      <DialogDescription>
                        Placed on {formatDate(order.orderDate)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between border-b pb-2">
                        <span>Status:</span>
                        <span className="text-yellow-600 font-medium">
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Products:</span>
                        <div className="flex flex-col items-end">
                          {order.orderItems.map((item) => (
                            <span key={item.product.productTitle}>
                              {item.product.productTitle} (x{item.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>${order.pricing.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>
                          {order.customer.firstName} {order.customer.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="flex mt-6 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(null)}
                        className="flex-1 mr-2"
                      >
                        <X />
                        Cancel
                      </Button>
                      <Button variant="secondary" className="flex-1 ml-2">
                        <Truck />
                        Ship Order
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No orders found</div>
        )}
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    {order.customer.firstName + " " + order.customer.lastName}
                  </TableCell>
                  <TableCell>${order.pricing.total}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {order.orderStatus === "pending" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Truck />
                            Ship
                          </Button>
                          {selectedOrder?.orderId === order.orderId && (
                            <Dialog
                              open={true}
                              onOpenChange={() => setSelectedOrder(null)}
                            >
                              <DialogContent className="w-sm">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order #{order.orderId}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Placed on {formatDate(order.orderDate)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 mt-4">
                                  <div className="flex justify-between border-b-2 pb-2">
                                    <span>Status:</span>
                                    <span className="text-yellow-600 font-medium">
                                      {order.orderStatus}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Products:</span>
                                    <div className="flex flex-col justify-end items-end">
                                      {order.orderItems.map((item) => (
                                        <span key={item.product.productTitle}>
                                          {item.product.productTitle} (x{item.quantity})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Amount:</span>
                                    <span>${order.pricing.total}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span>
                                      {order.customer.firstName}{" "}
                                      {order.customer.lastName}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex mt-6 w-full">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 mr-2"
                                  >
                                    <X />
                                    Cancel
                                  </Button>
                                  <Button variant="secondary" className="flex-1 ml-2">
                                    <Truck />
                                    Ship Order
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                      <Link href={`/seller/orders/${order._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye />
                          View
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SellerOrdersPage;
