"use client";
import axiosInstance from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CreditCard, Home, Building, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  productTitle: string;
  description: string;
  productImages: string[];
  category: string;
  brand: string;
  model: string;
  storage: string;
  colour: string;
  ram: string;
  condition: string;
  features: string[];
  price: number;
  salePrice?: number;
  quantity: number;
  sku: string;
  enableNegotiation: boolean;
  tags: string[];
  isFeatured: boolean;
  status: "active" | "low stock" | "out of stock";
  sellerId: string;
}

interface SelectedItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  product: string;
  quantity: number;
}

export interface ShippingAddress {
  type?: "Home" | "Work" | "Other";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  instructions?: string;
}

export interface Pricing {
  subtotal: number;
  shippingCost?: number;
  tax?: number;
  taxRate?: number;
  discount?: number;
  couponDiscount?: number;
  total: number;
  currency?: string;
}

export interface Payment {
  paymentMethod:
    | "credit_card"
    | "debit_card"
    | "paypal"
    | "stripe"
    | "bank_transfer"
    | "cash_on_delivery"
    | "digital_wallet";
  paymentStatus?:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "partially_refunded";
  transactionId?: string;
  paymentDate?: string;
  paymentProvider?: string;
}

export interface Shipping {
  shippingMethod?: "standard" | "express" | "overnight" | "pickup";
  shippingCost?: number;
  deliveryDate?: string;
  shippingDate?: string;
}

export interface Order {
  _id?: string;
  customer: string;
  orderItems: OrderItem[];
  orderStatus?:
    | "pending"
    | "confirmed"
    | "processing"
    | "partially_shipped"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "dispute";
  shippingAddress: ShippingAddress;
  pricing: Pricing;
  payment: Payment;
  shipping: Shipping;
  orderDate?: string;
}

interface PopulatedUser {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

interface Address {
  type?: "Home" | "Work" | "Other";
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

interface CustomerInterface {
  _id?: string;
  user: PopulatedUser;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  addresses?: Address[];
  orders?: string[];
}

const fetchProductsByIds = async (ids: string[]): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/products`, {
      params: { ids: ids.join(",") },
    });
    return response.data.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

const fetchCustomer = async (id: string): Promise<CustomerInterface> => {
  try {
    const response = await axiosInstance.get(`/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
};

const CheckOutPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [checkoutProducts, setCheckoutProducts] = useState<Product[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [customer, setCustomer] = useState<CustomerInterface | null>(null);
  const [formData, setFormData] = useState<Order>({
    customer: customerId || "",
    orderItems: [],
    orderStatus: "pending",
    shippingAddress: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    pricing: {
      subtotal: 0,
      total: 0,
      currency: "USD",
    },
    payment: {
      paymentMethod: "cash_on_delivery",
    },
    shipping: {
      shippingMethod: "standard",
    },
  });

  useEffect(() => {
    const initializeCheckout = async () => {
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);

        const itemsParam = searchParams.get("selectedItems");
        let parsedItems: SelectedItem[] = [];
        if (itemsParam) {
          try {
            parsedItems = JSON.parse(
              decodeURIComponent(itemsParam)
            ) as SelectedItem[];
          } catch (error) {
            console.error("Error parsing selectedItems from URL:", error);
            parsedItems = [];
          }
        }
        const customerIdParam = searchParams.get("customerId");
        setSelectedItems(parsedItems);
        setCustomerId(customerIdParam);

        // Fetch products
        if (parsedItems.length > 0) {
          const productIds = parsedItems.map((item) => item.productId);
          fetchProductsByIds(productIds).then((products) => {
            setCheckoutProducts(products);
          });
        }

        // Fetch customer details
        if (session?.user?.id) {
          try {
            const customerData = await fetchCustomer(session?.user.id);
            // console.log("Fetched customer data:", customerData);
            setCustomer(customerData);

            const defaultAddress =
              customerData.addresses?.find((addr) => addr.isDefault) ||
              customerData.addresses?.[0];

            setFormData((prev) => ({
              ...prev,
              customer: customerId || customer?._id || "",
              shippingAddress: {
                ...prev.shippingAddress,
                firstName: customerData.firstName || "",
                lastName: customerData.lastName || "",
                phone: customerData.phone || "",
                email: customerData.user?.email || "",
                street: defaultAddress?.street || "",
                city: defaultAddress?.city || "",
                state: defaultAddress?.state || "",
                zipCode: defaultAddress?.zipCode || "",
                country: defaultAddress?.country || "",
              },
            }));
          } catch (error) {
            console.error("Error fetching customer data:", error);
            toast.error(
              "Failed to fetch customer data. Please try again later."
            );
          }
        }
      }
    };

    initializeCheckout();
  }, [session?.user?.id, customerId, customer?._id]);

  // console.log(customer, "Customer Data");

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      const product = checkoutProducts.find((p) => p._id === item.productId);
      if (product) {
        const price = product.salePrice || product.price;
        return total + price * item.quantity;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value,
      },
    }));
  };

  const handleOrderCreation = async () => {
    try {
      // Prepare order items from selected items
      const orderItems = selectedItems.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      const orderData = {
        ...formData,
        orderItems,
        pricing: {
          subtotal,
          shippingCost: shipping,
          tax,
          total,
          currency: "USD",
        },
      };

      const response = await axiosInstance.post("/order", orderData);
      if (response.status === 200) {
        console.log("Order created successfully:", response.data);
        toast.success("Order created successfully!");
      } else {
        console.error("Failed to create order:", response.data);
        toast.error("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("An error occurred while creating the order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                ✓
              </div>
              <span>Cart</span>
            </div>
            <div className="mx-2">—</div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                ✓
              </div>
              <span>Checkout</span>
            </div>
            <div className="mx-2">—</div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs mr-2">
                3
              </div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Forms Section */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Shipping Information
              </h2>

              {/* Saved Addresses */}
              {customer?.addresses && customer.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Saved Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.addresses.map((address, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress,
                              street: address.street || "",
                              city: address.city || "",
                              state: address.state || "",
                              zipCode: address.zipCode || "",
                              country: address.country || "",
                            },
                          }));
                        }}
                      >
                        <div className="flex items-center mb-2">
                          {address.type === "Work" ? (
                            <Building className="w-4 h-4 mr-2 text-gray-500" />
                          ) : (
                            <Home className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <span className="text-sm font-medium">
                            {address.type || "Home"}
                          </span>
                          {address.isDefault && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.street}
                          <br />
                          {address.city}, {address.state} {address.zipCode}
                          <br />
                          {address.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default saved addresses if no customer addresses */}
              {(!customer?.addresses || customer.addresses.length === 0) && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Saved Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                      <div className="flex items-center mb-2">
                        <Home className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">Home</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        75 Powerscourt Centre, 129 Ste. James Margaret
                        <br />
                        Dublin, Ireland
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium">Work</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        2972 Westheimer Rd. Santa Ana, Illinois 85486
                        <br />
                        WorkBuilding 59, H-67 Ireland
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={`${formData.shippingAddress.firstName} ${formData.shippingAddress.lastName}`.trim()}
                    onChange={(e) => {
                      const names = e.target.value.split(" ");
                      const firstName = names[0] || "";
                      const lastName = names.slice(1).join(" ") || "";
                      setFormData((prev) => ({
                        ...prev,
                        shippingAddress: {
                          ...prev.shippingAddress,
                          firstName,
                          lastName,
                        },
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Zip/Postal Code *
                  </label>
                  <input
                    type="text"
                    placeholder="12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    placeholder="State/Province"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">
                    Billing address is the same as shipping
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center text-red-700">
                  <CreditCard className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    You will be redirected to ATT gateway, to complete your
                    transaction.
                  </span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  If you have trouble to finish your payment, please contact
                  customer service for help. Thank you. Online payment safety.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    className="mr-3 mt-0.5 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">
                    I understand I will complete my payment via a secure
                    external gateway (Recommended)
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-7">
                  By checking this box, you agree to use secure payment gateway
                  to finish your order
                </p>
              </div>

              <div className="mt-6">
                <label className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      className="mr-3 h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <span className="text-sm font-medium">
                      Cash On Delivery
                    </span>
                  </div>
                  <span className="text-green-600 text-sm">✓</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">
                  Pay cash when order is delivered
                </p>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Promo Code</h2>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Type promo code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button className="px-6 py-2 bg-secondary text-white rounded-r-md text-sm hover:bg-secondary/80 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {checkoutProducts.map((product) => {
                const selectedItem = selectedItems.find(
                  (item) => item.productId === product._id
                );
                const quantity = selectedItem?.quantity || 1;
                const price = product.salePrice || product.price;

                return (
                  <div
                    key={product._id}
                    className="flex items-start space-x-3 py-3 border-b border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {product.productImages && product.productImages[0] ? (
                        <img
                          src={product.productImages[0]}
                          alt={product.productTitle}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {product.productTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.colour} | {product.model}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold">
                          ${price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Quantity: {quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => router.back()}
                variant={"outline"}
                className="text-red-500 border border-red-200 hover:text-red-700 transition-colors rounded-sm hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleOrderCreation}
                className="bg-secondary text-white rounded-sm hover:bg-secondary/80 transition-colors "
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
