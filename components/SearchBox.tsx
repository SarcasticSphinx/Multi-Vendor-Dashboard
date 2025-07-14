"use client";
import React from "react";
import { ChevronDown, Heart, ShoppingCart } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";

const SearchBox = () => {
  const { data: session } = useSession();
  
  return (
    <form className="flex items-center p-4 lg:px-20 shadow-sm bg-white fixed top-18 left-0 z-50 w-full mx-auto border border-gray-200">
      {/* Categories Dropdown */}
      <div className="flex items-center border border-gray-300 rounded-l-sm px-2 sm:px-4 py-2 w-fit bg-white">
        <span className="text-gray-500 text-sm">Categories</span>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
      </div>
      
      {/* Search Input */}
      <div className="flex items-center flex-1 border border-gray-300 border-l-0 rounded-r-sm px-2 sm:px-4 py-2 bg-white">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search by product, brand, or keyword"
          className="w-full outline-none bg-transparent text-sm"
        />
      </div>
      
      {/* Search Button */}
      <button
        type="submit"
        className="sm:ml-4 sm:px-6 sm:py-2 p-2 ml-2 rounded bg-secondary text-white font-medium hover:bg-secondary/90 transition"
      >
        <span className="hidden sm:inline">Search</span>
        <FiSearch className="size-5 sm:hidden" />
      </button>
      
      {session?.user.role === "customer" && (
        <div className="flex items-center gap-4 ml-6">
          <Link href="/customer/wishlist">
            <Button variant="ghost" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </Button>
          </Link>

          <Link href="/customer/my-cart">
            <Button variant="ghost" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
            </Button>
          </Link>
        </div>
      )}
    </form>
  );
};

export default SearchBox;