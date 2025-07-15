"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, CircleHelp, CreditCard, Heart, House, Settings, ShoppingCart, Truck, UserRound, X } from "lucide-react";
import { useSession } from "next-auth/react";

// Context for sidebar state
const SidebarContext = createContext<{
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  
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

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar - Full width with labels */}
      <aside className="hidden lg:flex fixed left-0 top-20 pt-20 h-screen w-64 bg-white border-r border-gray-200 z-30">
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      pathname.includes(item.path)
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
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

      {/* Tablet Sidebar - Icon only */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-18 pt-20 h-full w-16 bg-white border-r border-gray-200 z-30">
        <nav className="flex-1 px-2 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors
                    ${
                      pathname.includes(item.path)
                        ? "bg-red-50 text-red-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar - Slide out */}
      <aside className={`fixed left-0 top-0 pt-20 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 md:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      pathname.includes(item.path)
                        ? "bg-red-50 text-red-600 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
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
    </>
  );
};

export default Sidebar;