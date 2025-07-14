"use client";
import Loading from "@/components/Loading";
import axiosInstance from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, ChevronDown, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/Modal";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Product {
  _id: string;
  productTitle: string;
  productImages: string[];
  sku: string;
  price: number;
  quantity: number;
  status: "active" | "low stock" | "out of stock";
  category: string;
  enableNegotiation: boolean;
}

const ProductsPage = () => {
  const {data: session} = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "seller") {
      redirect("/unauthorized");
    }
  const [sellerId, setSellerId] = useState<string>("");

  useEffect(()=> {
    const fetchSellerId = async () => {
      if (!session?.user.id) return;
      try {
        const response = await axiosInstance.get(`/seller/${session?.user.id}`);
        setSellerId(response.data._id);
      } catch (error) {
        console.error("Failed to fetch seller ID:", error);
      }
    };
    fetchSellerId();
  }, [session?.user.id]);

  // console.log(sellerId)

  // console.log(session?.user.id, "Session User ID");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    "All Categories",
    "Mobile",
    "Laptops & Accessories",
    "Wearables",
    "Headphones & Audio",
    "Kitchen & Dining",
    "Men's Clothing",
    "Women's Clothing",
    "Kid's Wear",
    "Skincare",
  ];

  const statuses = ["All", "Active", "Low stock", "Out of stock"];

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      if (!sellerId) {
        console.log("No seller ID found in session");
        setLoading(false);
        return;
      }
      const response = await axiosInstance.get(`/products?sellerId=${sellerId}`);
      setProducts(response.data.products || []);
      console.log("Fetched products:", response.data);
    } catch (error) {
      console.error("Error fetching products in client side:", error);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "low stock":
        return "text-yellow-600 bg-yellow-50";
      case "out of stock":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "low stock":
        return "Low Stock";
      case "out of stock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Active" && product.status === "active") ||
      (selectedStatus === "Low stock" && product.status === "low stock") ||
      (selectedStatus === "Out of stock" && product.status === "out of stock");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (productId: string) => {
    console.log("Edit product:", productId);
  };

  const handleDelete = async (productId: string) => {
    try {
      await axiosInstance.delete(`/products/${productId}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link href={"/seller/products/add-product"} className="no-underline">
          <button className="bg-secondary text-white px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-secondary/90 transition-colors">
            <Plus size={20} />
            Add Product
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 ">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or SKU"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border bg-white border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 min-w-[150px] justify-between"
          >
            <span className="text-gray-700">Category</span>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${
                isCategoryOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${
                    selectedCategory === category
                      ? "bg-secondary/10 text-secondary"
                      : "text-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 min-w-[130px] justify-between"
          >
            <span className="text-gray-700">Stock Status</span>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${
                isStatusOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isStatusOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-lg z-10">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm ${
                    selectedStatus === status
                      ? "bg-secondary/10 text-secondary"
                      : "text-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Image
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  SKU
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Stock
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Negotiation
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="relative w-full max-w-[50px] aspect-square bg-gray-200 rounded-lg">
                      {product.productImages?.length > 0 ? (
                        <Image
                          src={product.productImages[0]}
                          alt={product.productTitle}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 60px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    {product.productTitle}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{product.sku}</td>
                  <td className="py-4 px-4 text-gray-900">${product.price}</td>
                  <td className="py-4 px-4 text-gray-600">
                    {product.quantity}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={product.enableNegotiation}
                        readOnly
                        className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/seller/products/edit-product/${product._id}`}
                      >
                        <button
                          onClick={() => handleEdit(product._id)}
                          className="p-2 text-gray-600 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isModalOpen && (
                        <Modal
                          icon={<TriangleAlert size={24} className="text-red-600" />}
                          color="bg-red-50"
                          heading="Delete Product"
                          description="Are you sure you want to delete this product?"
                          detail="This action cannot be undone."
                          buttonName="Delete"
                          onCancel={() => setIsModalOpen(false)}
                          onConfirm={() => {
                            handleDelete(product._id);
                            setIsModalOpen(false);
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
