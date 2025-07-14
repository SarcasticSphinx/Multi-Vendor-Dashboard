"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

interface FormData {
  storeName: string;
  storeDescription: string;
  contactInfo: {
    email: string; // Assuming session?.user?.email is a string
    phone: string;
    socialMedia: {
      website: string;
      facebook: string;
      instagram: string;
      twitter: string;
      linkedin: string;
    };
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  bankDetails: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: "Checking" | "Savings" | "Other"; // Added common account types
  };
  paymentMethods: {
    bkash: string;
    nagad: string;
    bankTransfer: boolean;
  };
  businessCategories: string[];
  notificationPreferences: {
    orderNotifications: boolean;
    paymentNotifications: boolean;
    reviewNotifications: boolean;
    marketingUpdates: boolean;
    systemUpdates: boolean;
  };
}

const businessCategories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Recreation",
  "Books & Media",
  "Health & Beauty",
  "Automotive",
  "Food & Beverages",
  "Art & Crafts",
  "Other",
];

export default function BecomeSellerPage() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    storeDescription: "",
    contactInfo: {
      email: session?.user?.email || "",
      phone: "",
      socialMedia: {
        website: "",
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
    },
    businessAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    bankDetails: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "Checking",
    },
    paymentMethods: {
      bkash: "",
      nagad: "",
      bankTransfer: false,
    },
    businessCategories: [] as string[],
    notificationPreferences: {
      orderNotifications: true,
      paymentNotifications: true,
      reviewNotifications: true,
      marketingUpdates: false,
      systemUpdates: true,
    },
  });

  useEffect(() => {
    if (
      session?.user?.email &&
      formData.contactInfo.email !== session.user.email
    ) {
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: session.user.email as string, 
        },
      }));
    }
  }, [session, formData.contactInfo.email]);

  // console.log(formData.contactInfo.email, "Email from formData");
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");

      setFormData((prev) => {
        // Ensure parent is an object
        const parentObj =
          (prev[parent as keyof typeof prev] as Record<string, unknown>) ?? {};
        if (subChild) {
          const childObj = parentObj[child] ?? {};
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [subChild]: value,
              },
            },
          };
        } else {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value,
            },
          };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => {
        const parentObj = prev[parent as keyof typeof prev];
        if (parentObj && typeof parentObj === "object") {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: checked,
            },
          };
        }
        return {
          ...prev,
          [parent]: {
            [child]: checked,
          },
        };
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      const newCategories = prev.businessCategories.includes(category)
        ? prev.businessCategories.filter((c) => c !== category)
        : [...prev.businessCategories, category];
      return {
        ...prev,
        businessCategories: newCategories,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      await axiosInstance.post("/customer/become-a-seller", {
        ...formData,
        user: session.user.id,
      });

      toast.success("Seller account created successfully!");
      toast.info(
        "You will be logged out now. You need to log in again to access your seller dashboard."
      );
      signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error creating seller account:", error);
      toast.error("Failed to create seller account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
        <p className="text-gray-600">
          Join our marketplace and start selling your products to millions of
          customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name *</Label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="e.g. Tech Haven"
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your store..."
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactInfo.email">Email *</Label>
              <Input
                id="contactInfo.email"
                name="contactInfo.email"
                type="email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                required
                disabled
              />
            </div>
            <div>
              <Label htmlFor="contactInfo.phone">Phone Number *</Label>
              <Input
                id="contactInfo.phone"
                name="contactInfo.phone"
                type="tel"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                required
                placeholder="+8801XXXXXXXXX"
              />
            </div>
          </div>

          <h3 className="font-medium mt-6 mb-3">Social Media (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactInfo.socialMedia.website">Website</Label>
              <Input
                id="contactInfo.socialMedia.website"
                name="contactInfo.socialMedia.website"
                type="url"
                value={formData.contactInfo.socialMedia.website}
                onChange={handleChange}
                placeholder="https://yourstore.com"
              />
            </div>
            <div>
              <Label htmlFor="contactInfo.socialMedia.facebook">Facebook</Label>
              <Input
                id="contactInfo.socialMedia.facebook"
                name="contactInfo.socialMedia.facebook"
                type="url"
                value={formData.contactInfo.socialMedia.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="contactInfo.socialMedia.instagram">
                Instagram
              </Label>
              <Input
                id="contactInfo.socialMedia.instagram"
                name="contactInfo.socialMedia.instagram"
                type="url"
                value={formData.contactInfo.socialMedia.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div>
              <Label htmlFor="contactInfo.socialMedia.twitter">Twitter/X</Label>
              <Input
                id="contactInfo.socialMedia.twitter"
                name="contactInfo.socialMedia.twitter"
                type="url"
                value={formData.contactInfo.socialMedia.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Business Address</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessAddress.street">Street Address *</Label>
              <Input
                id="businessAddress.street"
                name="businessAddress.street"
                value={formData.businessAddress.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="businessAddress.city">City *</Label>
                <Input
                  id="businessAddress.city"
                  name="businessAddress.city"
                  value={formData.businessAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessAddress.state">State/Province *</Label>
                <Input
                  id="businessAddress.state"
                  name="businessAddress.state"
                  value={formData.businessAddress.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessAddress.zipCode">
                  ZIP/Postal Code *
                </Label>
                <Input
                  id="businessAddress.zipCode"
                  name="businessAddress.zipCode"
                  value={formData.businessAddress.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="businessAddress.country">Country *</Label>
              <Input
                id="businessAddress.country"
                name="businessAddress.country"
                value={formData.businessAddress.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankDetails.bankName">Bank Name *</Label>
              <Input
                id="bankDetails.bankName"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bankDetails.accountHolderName">
                Account Holder Name *
              </Label>
              <Input
                id="bankDetails.accountHolderName"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bankDetails.accountNumber">
                Account Number *
              </Label>
              <Input
                id="bankDetails.accountNumber"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="bankDetails.routingNumber">
                Routing Number *
              </Label>
              <Input
                id="bankDetails.routingNumber"
                name="bankDetails.routingNumber"
                value={formData.bankDetails.routingNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label>Account Type *</Label>
              <Select
                value={formData.bankDetails.accountType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      accountType: value as "Checking" | "Savings" | "Other",
                    },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethods.bkash">bKash Number</Label>
                <Input
                  id="paymentMethods.bkash"
                  name="paymentMethods.bkash"
                  value={formData.paymentMethods.bkash}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethods.nagad">Nagad Number</Label>
                <Input
                  id="paymentMethods.nagad"
                  name="paymentMethods.nagad"
                  value={formData.paymentMethods.nagad}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentMethods.bankTransfer"
                checked={formData.paymentMethods.bankTransfer}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "paymentMethods.bankTransfer",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="paymentMethods.bankTransfer">
                Accept Bank Transfers
              </Label>
            </div>
          </div>
        </div>

        {/* Business Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Business Categories</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select all categories that apply to your products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {businessCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={formData.businessCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="orderNotifications"
                checked={formData.notificationPreferences.orderNotifications}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "notificationPreferences.orderNotifications",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="orderNotifications">Order Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentNotifications"
                checked={formData.notificationPreferences.paymentNotifications}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "notificationPreferences.paymentNotifications",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="paymentNotifications">
                Payment Notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reviewNotifications"
                checked={formData.notificationPreferences.reviewNotifications}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "notificationPreferences.reviewNotifications",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="reviewNotifications">Review Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketingUpdates"
                checked={formData.notificationPreferences.marketingUpdates}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "notificationPreferences.marketingUpdates",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="marketingUpdates">Marketing Updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="systemUpdates"
                checked={formData.notificationPreferences.systemUpdates}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(
                    "notificationPreferences.systemUpdates",
                    checked as boolean
                  )
                }
              />
              <Label htmlFor="systemUpdates">System Updates</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
