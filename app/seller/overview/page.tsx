'use client';
import { useSession } from "next-auth/react";
import React from "react";
import { FiBox, FiTruck, FiCheckCircle, FiXCircle, FiTrendingUp, FiAlertCircle } from "react-icons/fi";

const OverviewPage: React.FC = () => {
  const { data: session } = useSession();
  console.log(session)
  return (
    <div className="py-6 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.user.name}!</h1>
        <p className="mt-1 text-gray-700">
          You&apos;ve made <span className="font-semibold">$2,450</span> today.
        </p>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales Today</div>
          <div className="text-2xl font-bold">$2,450</div>
          <div className="text-green-600 text-xs mt-1">+15% from last period</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales This Week</div>
          <div className="text-2xl font-bold">$10,230</div>
          <div className="text-green-600 text-xs mt-1">+8% from last period</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-500 text-sm">Sales This Month</div>
          <div className="text-2xl font-bold">$45,670</div>
          <div className="text-green-600 text-xs mt-1">+12% from last period</div>
        </div>
      </div>

      {/* Orders Status */}
      <div className="bg-white rounded-lg p-4 shadow mt-6">
        <div className="font-semibold mb-3">Orders Status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500"><FiBox /></span>
            <span>Pending</span>
            <span className="ml-auto font-bold">12</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-500"><FiTruck /></span>
            <span>Shipped</span>
            <span className="ml-auto font-bold">24</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500"><FiCheckCircle /></span>
            <span>Delivered</span>
            <span className="ml-auto font-bold">156</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-red-500"><FiXCircle /></span>
            <span>Cancelled</span>
            <span className="ml-auto font-bold">3</span>
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
          Revenue Chart
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 flex items-center justify-between">
        <div className="flex items-center text-yellow-700">
          <FiAlertCircle className="mr-2" />
          You have <span className="font-semibold mx-1">2 products</span> running low. Restock now.
        </div>
        <button className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200 transition">
          View Products
        </button>
      </div>
    </div>
  );
};

export default OverviewPage;