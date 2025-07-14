"use client";

import React from "react";
import { Globe, Bell, HelpCircle } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Navbar: React.FC = () => {
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b border-gray-200 bg-white lg:px-20 fixed top-0 left-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        {/* Logo */}
        <div className="font-bold text-xl sm:text-2xl text-secondary cursor-pointer" onClick={() => redirect('/')}>Logo</div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Language - Hidden on mobile */}
          <button className="hidden sm:flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
            <Globe size={20} />
            <span className="text-sm font-medium">EN</span>
            <FaChevronDown size={12} />
          </button>

          {/* Help - Show icon only on mobile */}
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
            <HelpCircle size={20} />
            <span className="hidden sm:inline text-sm font-medium">Help</span>
          </button>

          {session?.user ? (
            <>
              {/* Notifications */}
              <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <Bell size={22} className="text-gray-700" />
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </button>

              {/* User - Simplified on mobile */}
              <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                    {session?.user?.name?.[0]}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-gray-900">
                  {session?.user?.name}
                </span>
                <FaChevronDown
                  size={12}
                  className="hidden sm:inline text-gray-500"
                />
              </button>

              {/* Sign Out - Text hidden on mobile */}
              <button
                onClick={() => signOut()}
                className="px-2 sm:px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary transition text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 border border-secondary hover:bg-secondary hover:text-white rounded-md transition text-sm"
            >
              <span className="hidden sm:inline">SignIn</span>
              <span className="sm:hidden">SignIn</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
