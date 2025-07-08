import React from "react";
import { Globe, Bell, HelpCircle } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";

const Navbar = () => {
    return (
        <nav className="w-full border-b border-gray-200 bg-white lg:px-20 fixed top-0 left-0 z-50 shadow-sm">
            <div className="flex items-center justify-between px-8 py-4">
                {/* Logo */}
                <div className="font-bold text-2xl text-secondary">Logo</div>

                {/* Right section */}
                <div className="flex items-center gap-6">
                    {/* Language */}
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
                        <Globe size={20} />
                        <span className="text-sm font-medium">EN</span>
                        <FaChevronDown size={12} />
                    </button>

                    {/* Help */}
                    <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
                        <HelpCircle size={20} />
                        <span className="text-sm font-medium">Help</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <Bell size={22} className="text-gray-700" />
                        <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            1
                        </span>
                    </button>

                    {/* User */}
                    <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition">
                        <span className="bg-gray-200 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center font-semibold text-sm">
                            JD
                        </span>
                        <span className="text-sm font-semibold text-gray-900">John Doe</span>
                        <FaChevronDown size={12} className="text-gray-500" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;