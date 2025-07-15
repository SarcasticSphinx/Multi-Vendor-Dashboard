import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SearchBox from "@/components/SearchBox";
import Sidebar, { SidebarProvider } from "@/components/Sidebar";
import { ToastContainer } from "react-toastify";
import AuthProvider from "../lib/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "500", "700"],
});

export const metadata: Metadata = {
  title: "Multi Vendor E-commerce",
  description:
    "This is a multi-vendor e-commerce platform built with Next.js and TypeScript.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-gray-50`}>
        <AuthProvider session={session}>
          <SidebarProvider>
            <Navbar />
            <SearchBox />
            <Sidebar />
            <div
              className={`${
                session
                  ? "pl-0 md:pl-16 lg:pl-64 pt-40 lg:pr-20"
                  : "min-h-screen mt-20 flex items-center justify-center px-4 sm:px-30"
              }`}
            >
              {children}
            </div>
          </SidebarProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </body>
    </html>
  );
}