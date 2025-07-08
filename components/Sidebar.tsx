"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, CreditCard, House, Settings, ShoppingCart } from "lucide-react";

const navItems = [
  { path: "/overview", label: "Overview", icon: <House size={20} /> },
  { path: "/products", label: "Products", icon: <Box size={20} /> },
  { path: "/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  { path: "/payments", label: "Payments", icon: <CreditCard size={20} /> },
  { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="min-w-80 min-h-screen bg-white border-r border-gray-200 fixed flex pl-20 pr-4 top-34">
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
  );
};

export default Sidebar;
