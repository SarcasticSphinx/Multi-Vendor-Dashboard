"use client";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

interface Order {
  orderStatus: string;
}

interface SellerData {
  orders: Order[];
  salesMetrics: {
    totalSales: number;
    totalRevenue: number;
    totalOrders: number;
    monthlyRevenue: {
      month: string;
      revenue: number;
      orders: number;
    }[];
    todaySales?: number;
    weekSales?: number;
    monthSales?: number;
    todayRevenue?: number;
    weekRevenue?: number;
    monthRevenue?: number;
    todayGrowth?: number;
    weekGrowth?: number;
    monthGrowth?: number;
  };
  lowStockProducts?: number;
}

const getOrderStatusCount = (orders: Order[], status: string) =>
  orders.filter((order) => order.orderStatus === status).length;

const OverviewPage: React.FC = () => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/seller/${session.user.id}`);
        setSellerData(response.data);
      } catch (error) {
        toast.error("Failed to fetch seller data");
        console.error("Error fetching seller data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [session?.user?.id]);

  if (loading) {
    return <Loading />;
  }

  // Fallbacks for missing data
  const orders = sellerData?.orders || [];
  const lowStockProducts = 2;

  // Example: fallback to 0 if undefined
  const todayRevenue = sellerData?.salesMetrics.todayRevenue ?? 0;
  const weekRevenue = sellerData?.salesMetrics.weekRevenue ?? 0;
  const monthRevenue = sellerData?.salesMetrics.monthRevenue ?? 0;
  const todayGrowth = sellerData?.salesMetrics.todayGrowth ?? 0;
  const weekGrowth = sellerData?.salesMetrics.weekGrowth ?? 0;
  const monthGrowth = sellerData?.salesMetrics.monthGrowth ?? 0;

  return (
    <div className="py-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user.name}!
        </h1>
        <p className="mt-1 text-gray-700">
          You&apos;ve made{" "}
          <span className="font-semibold">
            ${todayRevenue.toLocaleString()}
          </span>{" "}
          today.
        </p>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales Today</div>
          <div className="text-2xl font-bold">
            ${todayRevenue.toLocaleString()}
          </div>
          <div className="text-green-600 text-xs mt-1">
            {todayGrowth >= 0 ? "+" : ""}
            {todayGrowth}% from last period
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales This Week</div>
          <div className="text-2xl font-bold">
            ${weekRevenue.toLocaleString()}
          </div>
          <div className="text-green-600 text-xs mt-1">
            {weekGrowth >= 0 ? "+" : ""}
            {weekGrowth}% from last period
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales This Month</div>
          <div className="text-2xl font-bold">
            ${monthRevenue.toLocaleString()}
          </div>
          <div className="text-green-600 text-xs mt-1">
            {monthGrowth >= 0 ? "+" : ""}
            {monthGrowth}% from last period
          </div>
        </div>
      </div>

      {/* Orders Status */}
      <div className="bg-white rounded-lg p-4 shadow mt-6 border">
        <div className="font-semibold mb-3">Orders Status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Pending */}
          <div className="border rounded-lg p-4 flex flex-col items-start bg-white">
            <div className="flex items-center mb-2">
              <span className="h-3 w-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
              <span className="text-gray-700 font-medium">Pending</span>
            </div>
            <div className="text-xl font-bold mt-1 ml-3">
              {getOrderStatusCount(orders, "Pending")}
            </div>
          </div>
          {/* Shipped */}
          <div className="border rounded-lg p-4 flex flex-col items-start bg-white">
            <div className="flex items-center mb-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 inline-block mr-2"></span>
              <span className="text-gray-700 font-medium">Shipped</span>
            </div>
            <div className="text-xl font-bold mt-1 ml-3">
              {getOrderStatusCount(orders, "Shipped")}
            </div>
          </div>
          {/* Delivered */}
          <div className="border rounded-lg p-4 flex flex-col items-start bg-white">
            <div className="flex items-center mb-2">
              <span className="h-3 w-3 rounded-full bg-green-500 inline-block mr-2"></span>
              <span className="text-gray-700 font-medium">Delivered</span>
            </div>
            <div className="text-xl font-bold mt-1 ml-3">
              {getOrderStatusCount(orders, "Delivered")}
            </div>
          </div>
          {/* Cancelled */}
          <div className="border rounded-lg p-4 flex flex-col items-start bg-white">
            <div className="flex items-center mb-2">
              <span className="h-3 w-3 rounded-full bg-red-500 inline-block mr-2"></span>
              <span className="text-gray-700 font-medium">Cancelled</span>
            </div>
            <div className="text-xl font-bold mt-1 ml-3">
              {getOrderStatusCount(orders, "Cancelled")}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-white rounded-lg p-4 shadow mt-6 border border-blue-200">
        <div className="font-semibold mb-2 flex items-center">
          <FiTrendingUp className="mr-2" />
          Revenue Trend (30 days)
        </div>
        <div className="h-40 flex items-center justify-center text-gray-400">
          {/* You can replace this with a chart using salesMetrics.monthlyRevenue */}
          Revenue Chart
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 flex items-center justify-between">
        <div className="flex items-center text-yellow-700">
          <FiAlertCircle className="mr-2" />
          You have{" "}
          <span className="font-semibold mx-1">
            {lowStockProducts} products
          </span>{" "}
          running low. Restock now.
        </div>
        <Link
          href={"/seller/products"}
          className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition"
        >
          View Products
        </Link>
      </div>
    </div>
  );
};

export default OverviewPage;
