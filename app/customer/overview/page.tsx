"use client";
import React, { useEffect, useState } from "react";
import {
  Heart,
  Truck,

  CheckCircle,
  ClipboardList,
  Loader2,
  Package,
  Gift,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import Loading from "@/components/Loading";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
}

interface ActivityItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  time: string;
  color: string;
}

interface PopulatedUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

interface CustomerInterface {
  _id?: string;
  user: PopulatedUser;
  firstName?: string;
  lastName?: string;
  orders?: string[];
  wishlist?: string[];
  coupons?: string[];
  recent_activities?: {
    title: string;
    description?: string;
    time: string;
  }[];
  updatedAt?: Date;
}

const OverviewPage: React.FC = () => {
  const { data: session } = useSession();
  const [customerData, setCustomerData] = useState<CustomerInterface | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!session?.user.id) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/customer/${session.user.id}`
        );
        setCustomerData(response.data);
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [session?.user.id]);

  const stats: StatCard[] = [
    {
      label: "Total Orders",
      value: customerData?.orders?.length || 0,
      icon: <Package className="w-6 h-6 text-primary" strokeWidth={2} />,
      loading,
    },
    {
      label: "Wishlist Items",
      value: customerData?.wishlist?.length || 0,
      icon: <Heart className="w-6 h-6 text-secondary" strokeWidth={2} />,
      loading,
    },
    {
      label: "Pending Deliveries",
      value: customerData?.orders?.length || 0,
      icon: <Truck className="w-6 h-6 text-yellow-400" strokeWidth={2} />,
      loading,
    },
    {
      label: "Active Coupons",
      value: customerData?.coupons?.length || 0,
      icon: (
        <Gift className="w-6 h-6 text-green-400" strokeWidth={2} />
      ),
      loading,
    },
  ];

  const activities: ActivityItem[] = customerData?.recent_activities?.length
    ? customerData.recent_activities.map((activity) => ({
        icon: (
          <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={2} />
        ),
        title: activity.title,
        desc: activity.description || "",
        time: activity.time,
        color: "text-green-500",
      }))
    : [
        {
          icon: (
            <ClipboardList className="w-5 h-5 text-primary" strokeWidth={2} />
          ),
          title: "No recent activities",
          desc: "Your recent activities will appear here",
          time: "",
          color: "text-gray-400",
        },
      ];

  if (loading) <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          Hi, {customerData?.user.name || "User"}{" "}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <span className="text-sm text-gray-500 mt-2 md:mt-0">
          {customerData?.updatedAt
            ? `Last updated: ${new Date(
                customerData.updatedAt
              ).toLocaleDateString()} at ${new Date(
                customerData.updatedAt
              ).toLocaleTimeString()}`
            : "No updates yet"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-sm shadow-sm p-4 flex justify-between items-center gap-4 border hover:shadow-md transition-shadow"
          >
            <div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
              {stat.loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : (
                <div className="text-2xl font-semibold">{stat.value}</div>
              )}
            </div>
            <div className="bg-gray-100 rounded-full p-2">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-sm shadow-sm p-6 border">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent activities found
          </div>
        ) : (
          <ul className="divide-y">
            {activities.map((activity, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${activity.color}`}>
                    {activity.icon}
                  </span>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    {activity.desc && (
                      <div className="text-gray-500 text-sm">
                        {activity.desc}
                      </div>
                    )}
                  </div>
                </div>
                {activity.time && (
                  <span className="text-gray-400 text-xs min-w-max ml-4">
                    {activity.time}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OverviewPage;
