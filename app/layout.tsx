import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SearchBox from "@/components/SearchBox";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "react-toastify";
import AuthProvider from "../lib/AuthProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "500", "700"], // Add the desired font weights as needed
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
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <SearchBox />
          <Sidebar />
          <div
            className={`${
              session ? "pl-18 mt-34 pr-4 sm:pl-90 sm:mt-36 sm:pr-20" : "min-h-screen mt-20 flex items-center justify-center px-4 sm:px-30"
            } `}
          >
            {children}
          </div>
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
