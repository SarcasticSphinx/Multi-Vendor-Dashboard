"use client";
import React from "react";
import {
  ShoppingBag,
  Heart,
  Truck,
  TicketPercent,
  CheckCircle,
  Star,
  ClipboardList,
} from "lucide-react";
import { useSession } from "next-auth/react";

const stats = [
  {
    label: "Total Orders",
    value: 24,
    icon: <ShoppingBag className="w-6 h-6 text-primary" strokeWidth={2} />,
  },
  {
    label: "Wishlist Items",
    value: 12,
    icon: <Heart className="w-6 h-6 text-secondary" strokeWidth={2} />,
  },
  {
    label: "Pending Deliveries",
    value: 3,
    icon: <Truck className="w-6 h-6 text-yellow-400" strokeWidth={2} />,
  },
  {
    label: "Active Coupons",
    value: 5,
    icon: <TicketPercent className="w-6 h-6 text-green-400" strokeWidth={2} />,
  },
];

const activities = [
  {
    icon: <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={2} />,
    title: "Order Delivered",
    desc: "Your order #ORD-7895 has been delivered",
    time: "Today, 9:45 AM",
    color: "text-green-600",
  },
  {
    icon: <Heart className="w-5 h-5 text-secondary" strokeWidth={2} />,
    title: "Added to Wishlist",
    desc: "You added Wireless Headphones to your wishlist",
    time: "Yesterday, 4:30 PM",
    color: "text-secondary",
  },
  {
    icon: <ClipboardList className="w-5 h-5 text-primary" strokeWidth={2} />,
    title: "Order Shipped",
    desc: "Your order #ORD-7891 has been shipped",
    time: "Yesterday, 11:20 AM",
    color: "text-primary",
  },
  {
    icon: <Star className="w-5 h-5 text-yellow-500" strokeWidth={2} />,
    title: "Review Posted",
    desc: "You posted a review for 'Smart Watch'",
    time: "May 20, 2023",
    color: "text-yellow-500",
  },
  {
    icon: <TicketPercent className="w-5 h-5 text-purple-500" strokeWidth={2} />,
    title: "Coupon Applied",
    desc: "You used coupon 'SUMMER20' on your purchase",
    time: "May 18, 2023",
    color: "text-purple-500",
  },
];

const OverviewPage: React.FC = () => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Unknown User";
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Hi, {userName}{" "}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <span className="text-sm text-gray-500 mt-2 md:mt-0">
          Last updated: Today, 10:30 AM
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 border"
          >
            <div className="bg-gray-100 rounded-full p-2">{stat.icon}</div>
            <div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
              <div className="text-2xl font-semibold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul>
          {activities.map((activity, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between py-3 border-b last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className={activity.color}>{activity.icon}</span>
                <div>
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-gray-500 text-sm">{activity.desc}</div>
                </div>
              </div>
              <span className="text-gray-400 text-xs min-w-max ml-4">
                {activity.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewPage;
