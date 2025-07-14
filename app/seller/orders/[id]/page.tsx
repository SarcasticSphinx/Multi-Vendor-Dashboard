"use client";
import axiosInstance from "@/lib/axios";
import React, { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoveLeft, Phone, Printer, Truck, X, Mail, MapPin, AlertTriangle } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OrderDetails {
  _id: string;
  orderId: string;
  orderItems: {
    product: {
      productTitle: string;
      productImages: string[];
      condition: string;
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
    user: {
      email: string;
    };
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
  const {data: session} = useSession();
  if (!session) {
    redirect("/login");
  }
  const par = use(params);
  const { id } = par;
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
    return <Loading/>;
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

  // Timeline steps for UI
  const timelineSteps = [
    {
      label: "Order Placed",
      date: order.timeline?.ordered || order.createdAt,
      active: true,
      description: formatDate(order.timeline?.ordered || order.createdAt),
    },
    {
      label: "Payment Confirmed",
      date: order.timeline?.paymentConfirmed,
      active: !!order.timeline?.paymentConfirmed,
      description: order.timeline?.paymentConfirmed
        ? formatDate(order.timeline.paymentConfirmed)
        : "Waiting for confirmation",
    },
    {
      label: "Processed",
      date: order.timeline?.processed,
      active: !!order.timeline?.processed,
      description: order.timeline?.processed
        ? formatDate(order.timeline.processed)
        : "Waiting for processing",
    },
    {
      label: "Shipped",
      date: order.timeline?.shipped,
      active: !!order.timeline?.shipped,
      description: order.timeline?.shipped
        ? formatDate(order.timeline.shipped)
        : "Not shipped yet",
    },
    {
      label: "Delivered",
      date: order.timeline?.delivered,
      active: !!order.timeline?.delivered,
      description: order.timeline?.delivered
        ? formatDate(order.timeline.delivered)
        : "Waiting for delivery",
    },
  ];

  return (
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MoveLeft onClick={() => router.back()} className="w-5 h-5" />
          <span className="text-xl font-semibold">Order Details</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Invoice
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Phone />
            Contact Buyer
          </Button>
        </div>
      </div>

      <div className="flex flex-col bg-white p-4 rounded-sm border shadow-sm">
        {" "}
        {/* Product Summary */}
        <Card className="mb-6">
          {order.orderItems.map((item, index) => (
            <CardContent key={index} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <img
                  src={item.product.productImages[0] || "/placeholder.png"}
                  alt={item.product.productTitle}
                  className="w-14 h-14 object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">
                    {item.product.productTitle}
                  </h3>
                  <Badge className="bg-orange-100 text-orange-700 border-none text-xs px-2 py-1">
                    {order.orderStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID</span>
                    <div className="font-medium">#{order.orderId}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Date</span>
                    <div className="font-medium">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity</span>
                    <div className="font-medium">{item.quantity}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Condition</span>
                    <div className="font-medium">{item.product.condition}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          ))}
        </Card>
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Timeline */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 ml-2">
                {timelineSteps.map((step) => (
                  <li key={step.label} className="mb-8 ml-4">
                    <div className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full -left-1.5 mt-1" />
                    <div className="font-medium">{step.label}</div>
                    <div className="text-gray-500 text-sm">
                      {step.description}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Buyer Information */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium">Buyer</span>
                <div className="font-semibold">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Mail className="w-4 h-4 inline" />
                  {order.customer.user.email}
                </div>
              </div>
              <div>
                <span className="font-medium">Shipping Address</span>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 inline" />
                  {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`}
                </div>
              </div>
              <div>
                <span className="font-medium">Payment Method</span>
                <div className="font-semibold">
                  {getPaymentMethod(order.payment.paymentMethod)}
                </div>
                <div className="text-gray-500 text-sm">
                  {order.payment.last4
                    ? `**** **** **** ${order.payment.last4}`
                    : "Not Paid Yet"}
                </div>
                <Badge
                  variant="secondary"
                  className="mt-1 bg-green-100 text-green-700 border-none"
                >
                  {order.payment.paymentStatus === "paid"
                    ? "Paid"
                    : order.payment.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Payment Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Subtotal</div>
                <div className="text-right">
                  ${order.pricing.subtotal.toFixed(2)}
                </div>
                <div className="text-gray-500">Shippng</div>
                <div className="text-right">
                  ${order.pricing.shippingCost.toFixed(2)}
                </div>
                <div className="text-gray-500">Tax</div>
                <div className="text-right">
                  ${order.pricing.tax.toFixed(2)}
                </div>
                <div className="text-gray-500">Discount</div>
                <div className="text-right">
                  ${order.pricing.discount.toFixed(2)}
                </div>
                <div className="font-medium">Total</div>
                <div className="font-medium text-right">
                  ${order.pricing.total.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 mt-8">
            <Button
            variant="outline"
            className="border-red-200 text-red-600"
            onClick={() => setShowCancelModal(true)}
            >
            <X />
            Cancel Order
            </Button>
            {/* Cancel Order Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent className="w-sm">
              <div className="flex flex-col items-center gap-2">
              <div className="bg-red-100 rounded-full p-3 mb-2">
                <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Cancel Order?</DialogTitle>
                <DialogDescription className="text-center">
                Are you sure you want to cancel this order? The customer will be notified and the order will be marked as cancelled.
                </DialogDescription>
              </DialogHeader>
              <div className="w-full mt-4">
                <label className="font-medium mb-1 block">
                Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <Textarea
                placeholder="Enter reason for cancellation"
                />
              </div>
              <div className="w-full bg-gray-50 rounded p-3 mt-4 text-sm">
                <div className="font-semibold mb-2">Order Summary</div>
                <div>Order ID: <span className="font-medium">#{order.orderId}</span></div>
                <div>Product: <span className="font-medium">{order.orderItems[0]?.product.productTitle}</span></div>
                <div>Customer: <span className="font-medium">{order.customer.firstName} {order.customer.lastName}</span></div>
              </div>
              <div className="flex gap-2 mt-6 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)}>
                Keep Order
                </Button>
                <Button
                variant="destructive"
                className="flex-1"

                >
                Cancel Order
                </Button>
              </div>
              </div>
            </DialogContent>
            </Dialog>
          <Button variant={"secondary"}>
            <Truck />
            Ship Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
