import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SearchBox from "@/components/SearchBox";
import Sidebar from "@/components/Sidebar";
import { ToastContainer } from "react-toastify";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Navbar />
        <SearchBox />
        <Sidebar />
        <div className="sm:pl-90 sm:mt-36 sm:pr-20">{children}</div>
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
      </body>
    </html>
  );
}
