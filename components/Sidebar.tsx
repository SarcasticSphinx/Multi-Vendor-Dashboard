"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, CircleHelp, CreditCard, Heart, House, Settings, ShoppingCart, Truck, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (!session) return null;
  const isSeller = session?.user.role === "seller";
  const navItems = isSeller
    ? [
        { path: "/seller/overview", label: "Overview", icon: <House size={24} /> },
        { path: "/seller/products", label: "Products", icon: <Box size={24} /> },
        { path: "/seller/orders", label: "Orders", icon: <ShoppingCart size={24} /> },
        { path: "/seller/payments", label: "Payments", icon: <CreditCard size={24} /> },
        { path: "/seller/settings", label: "Settings", icon: <Settings size={24} /> },
      ]
    : [
        { path: "/customer/overview", label: "Overview", icon: <House size={24} /> },
        { path: "/customer/my-orders", label: "My Orders", icon: <Truck size={24} /> },
        { path: "/customer/wishlist", label: "Wishlist", icon: <Heart size={24} /> },
        { path: "/customer/profile", label: "Profile", icon: <UserRound size={24} /> },
        { path: "/customer/support", label: "Support", icon: <CircleHelp size={24} /> },
        { path: "/customer/settings", label: "Settings", icon: <Settings size={24} /> }
      ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="min-w-80 min-h-screen bg-white border-r border-gray-200 fixed flex pl-20 pr-4 top-0 pt-40 hidden md:flex">
        <nav className="mt-4 w-full ">
          <ul className="space-y-2 w-full">
            {navItems.map((item) => (
              <li key={item.path} className="w-full">
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors w-full
                    ${
                      pathname.includes(item.path)
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile side Navigation */}
      <nav className="fixed top-0 pt-42 min-w-14 bottom-0 left-0 bg-white border-t border-gray-200 flex flex-col gap-6 items-center py-6 md:hidden z-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center px-2
              ${
                pathname.includes(item.path)
                  ? "text-red-600"
                  : "text-gray-600"
              }
            `}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
