"use client";
import axiosInstance from "@/lib/axios";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: { id: string };
}

interface OrderDetails {
  _id: string;
  orderId: string;
  orderItems: {
    product: {
      name: string;
    };
    quantity: number;
  }[];
  orderStatus: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  pricing: {
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    paymentMethod: string;
    paymentStatus: string;
    last4?: string;
  };
  timeline?: {
    ordered?: string;
    paymentConfirmed?: string;
    processed?: string;
    shipped?: string;
    delivered?: string;
  };
}

const OrderDetailsPage = ({ params }: PageProps) => {
  const { id } = params;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosInstance.get(`/order/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-4">Order not found</div>;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "paypal":
        return "PayPal";
      case "stripe":
        return "Stripe";
      case "bank_transfer":
        return "Bank Transfer";
      case "cash_on_delivery":
        return "Cash on Delivery";
      case "digital_wallet":
        return "Digital Wallet";
      default:
        return method;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      {/* Product Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {order.orderItems[0]?.product?.name || "Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Quantity</p>
              <p className="font-medium">{order.orderItems[0]?.quantity || 1}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <Badge variant="outline" className="capitalize">
                {order.orderStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-gray-500">
                {formatDate(order.timeline?.ordered || order.createdAt)}
              </p>
            </div>
            <div>
              <p className="font-medium">Payment Confirmed</p>
              <p className="text-gray-500">
                {order.timeline?.paymentConfirmed
                  ? formatDate(order.timeline.paymentConfirmed)
                  : "Waiting for confirmation"}
              </p>
            </div>
            <div>
              <p className="font-medium">Processed</p>
              <p className="text-gray-500">
                {order.timeline?.processed
                  ? formatDate(order.timeline.processed)
                  : "Waiting for processing"}
              </p>
            </div>
            <div>
              <p className="font-medium">Shipped</p>
              <p className="text-gray-500">
                {order.timeline?.shipped
                  ? formatDate(order.timeline.shipped)
                  : "Not shipped yet"}
              </p>
            </div>
            <div>
              <p className="font-medium">Delivered</p>
              <p className="text-gray-500">
                {order.timeline?.delivered
                  ? formatDate(order.timeline.delivered)
                  : "Waiting for delivery"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Buyer</p>
              <p className="text-gray-500">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-gray-500">{order.customer.email}</p>
            </div>
            <div>
              <p className="font-medium">Shipping Address</p>
              <p className="text-gray-500">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}, {order.shippingAddress.country},{" "}
                {order.shippingAddress.zipCode}
              </p>
            </div>
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-gray-500">
                {getPaymentMethod(order.payment.paymentMethod)}{" "}
                {order.payment.last4 && `**** **** **** ${order.payment.last4}`}
              </p>
              <Badge
                variant={
                  order.payment.paymentStatus === "completed"
                    ? "default"
                    : "secondary"
                }
                className="mt-1"
              >
                {order.payment.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <p className="text-gray-500">Subtotal</p>
            <p className="text-right">${order.pricing.subtotal.toFixed(2)}</p>
            <p className="text-gray-500">Shipping</p>
            <p className="text-right">${order.pricing.shippingCost.toFixed(2)}</p>
            <p className="text-gray-500">Tax</p>
            <p className="text-right">${order.pricing.tax.toFixed(2)}</p>
            <p className="text-gray-500">Discount</p>
            <p className="text-right">${order.pricing.discount.toFixed(2)}</p>
            <p className="font-medium">Total</p>
            <p className="font-medium text-right">
              ${order.pricing.total.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        {order.orderStatus === "pending" && (
          <Button variant="outline">Cancel Order</Button>
        )}
        {["pending", "processing"].includes(order.orderStatus) && (
          <Button>Mark as Shipped</Button>
        )}
        <Button variant="secondary">Print Invoice</Button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;