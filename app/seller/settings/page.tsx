"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axios";
import Loading from "@/components/Loading";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

interface SellerData {
  storeName: string;
  storeDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    socialMedia: {
      website?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
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
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountType?: "Checking" | "Savings";
  };
  paymentMethods: {
    bkash?: string;
    nagad?: string;
    bankTransfer?: boolean;
  };
  notificationPreferences: {
    orderNotifications: boolean;
    paymentNotifications: boolean;
    reviewNotifications: boolean;
    marketingUpdates: boolean;
    systemUpdates: boolean;
  };
  businessCategories: string[];
}

const SettingsPage = () => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "seller") {
      redirect("/unauthorized");
    }
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        console.log("Fetching seller data for ID:", session.user.id);
        const response = await axiosInstance.get(`/seller/${session.user.id}`);

        setSellerData(response.data);
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
        toast.error("Failed to fetch seller data");
      } finally {
        setLoading(false);
      }
    };
    fetchSellerData();
  }, [session?.user?.id]);

  const handleSwitchChange = (name: string, checked: boolean) => {
    const [parent, child] = name.split(".");

    setSellerData((prev) => {
      if (!prev) return null;

      const parentObject = prev[parent as keyof SellerData];

      if (typeof parentObject === "object" && parentObject !== null) {
        return {
          ...prev,
          [parent]: {
            ...parentObject,
            [child]: checked,
          },
        };
      } else {
        if (!child) {
          return {
            ...prev,
            [name]: checked,
          };
        }
        console.warn(
          `Attempted to switch change on non-object parent: ${parent}`
        );
        return prev;
      }
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    const [parent, child] = name.split(".");

    setSellerData((prev) => {
      if (!prev) return null;

      const parentObject = prev[parent as keyof SellerData];

      if (typeof parentObject === "object" && parentObject !== null) {
        return {
          ...prev,
          [parent]: {
            ...parentObject,
            [child]: value,
          },
        };
      } else {
        if (!child) {
          return {
            ...prev,
            [name]: value,
          };
        }
        console.warn(
          `Attempted to select change on non-object parent: ${parent}`
        );
        return prev;
      }
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const [parent, child] = name.split(".");

    setSellerData((prev) => {
      if (!prev) return null;

      if (child) {
        const parentObject = prev[parent as keyof SellerData];
        if (typeof parentObject === "object" && parentObject !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObject,
              [child]: value,
            },
          };
        } else {
          console.warn(
            `Attempted to input change on non-object parent: ${parent}`
          );
          return prev;
        }
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerData || !session?.user?.id) return;

    try {
      setIsSaving(true);
      await axiosInstance.patch(`/seller/${session.user.id}`, sellerData);
      toast("Seller settings updated successfully");
    } catch (error) {
      console.error("Failed to update seller data:", error);
      toast("Failed to update seller data");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!sellerData) return <div>Failed to load seller data</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Seller Settings</h1>

      <form onSubmit={handleSubmit}>
        {/* Store Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                value={sellerData.storeName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                value={sellerData.storeDescription}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactInfo.email">Email</Label>
              <Input
                id="contactInfo.email"
                name="contactInfo.email"
                type="email"
                value={sellerData.contactInfo.email}
                onChange={handleInputChange}
                required
                disabled
              />
            </div>
            <div>
              <Label htmlFor="contactInfo.phone">Phone</Label>
              <Input
                id="contactInfo.phone"
                name="contactInfo.phone"
                value={sellerData.contactInfo.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactInfo.socialMedia.website">Website</Label>
                <Input
                  id="contactInfo.socialMedia.website"
                  name="contactInfo.socialMedia?.website"
                  value={sellerData.contactInfo.socialMedia?.website || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="contactInfo.socialMedia?.facebook">
                  Facebook
                </Label>
                <Input
                  id="contactInfo.socialMedia.facebook"
                  name="contactInfo.socialMedia.facebook"
                  value={sellerData.contactInfo.socialMedia?.facebook || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="contactInfo.socialMedia.instagram">
                  Instagram
                </Label>
                <Input
                  id="contactInfo.socialMedia.instagram"
                  name="contactInfo.socialMedia.instagram"
                  value={sellerData.contactInfo.socialMedia?.instagram || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="contactInfo.socialMedia.twitter">Twitter</Label>
                <Input
                  id="contactInfo.socialMedia.twitter"
                  name="contactInfo.socialMedia.twitter"
                  value={sellerData.contactInfo.socialMedia?.twitter || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessAddress.street">Street Address</Label>
              <Input
                id="businessAddress.street"
                name="businessAddress.street"
                value={sellerData.businessAddress.street}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="businessAddress.city">City</Label>
                <Input
                  id="businessAddress.city"
                  name="businessAddress.city"
                  value={sellerData.businessAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessAddress.state">State</Label>
                <Input
                  id="businessAddress.state"
                  name="businessAddress.state"
                  value={sellerData.businessAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessAddress.zipCode">Zip Code</Label>
                <Input
                  id="businessAddress.zipCode"
                  name="businessAddress.zipCode"
                  value={sellerData.businessAddress.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="businessAddress.country">Country</Label>
              <Input
                id="businessAddress.country"
                name="businessAddress.country"
                value={sellerData.businessAddress.country}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankDetails.bankName">Bank Name</Label>
              <Input
                id="bankDetails.bankName"
                name="bankDetails.bankName"
                value={sellerData.bankDetails.bankName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="bankDetails.accountHolderName">
                Account Holder Name
              </Label>
              <Input
                id="bankDetails.accountHolderName"
                name="bankDetails.accountHolderName"
                value={sellerData.bankDetails.accountHolderName || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankDetails.accountNumber">
                  Account Number
                </Label>
                <Input
                  id="bankDetails.accountNumber"
                  name="bankDetails.accountNumber"
                  value={sellerData.bankDetails.accountNumber || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="bankDetails.routingNumber">
                  Routing Number
                </Label>
                <Input
                  id="bankDetails.routingNumber"
                  name="bankDetails.routingNumber"
                  value={sellerData.bankDetails.routingNumber || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bankDetails.accountType">Account Type</Label>
              <Select
                value={sellerData.bankDetails.accountType || "Checking"}
                onValueChange={(value) =>
                  handleSelectChange("bankDetails.accountType", value)
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
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethods.bkash">bKash Number</Label>
                <Input
                  id="paymentMethods.bkash"
                  name="paymentMethods.bkash"
                  value={sellerData.paymentMethods.bkash || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethods.nagad">Nagad Number</Label>
                <Input
                  id="paymentMethods.nagad"
                  name="paymentMethods.nagad"
                  value={sellerData.paymentMethods.nagad || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="paymentMethods.bankTransfer"
                checked={sellerData.paymentMethods.bankTransfer || false}
                onCheckedChange={(checked) =>
                  handleSwitchChange("paymentMethods.bankTransfer", checked)
                }
              />
              <Label htmlFor="paymentMethods.bankTransfer">Bank Transfer</Label>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationPreferences.orderNotifications">
                  Order Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications for new orders
                </p>
              </div>
              <Switch
                id="notificationPreferences.orderNotifications"
                checked={sellerData.notificationPreferences.orderNotifications}
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "notificationPreferences.orderNotifications",
                    checked
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationPreferences.paymentNotifications">
                  Payment Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications for payments
                </p>
              </div>
              <Switch
                id="notificationPreferences.paymentNotifications"
                checked={
                  sellerData.notificationPreferences.paymentNotifications
                }
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "notificationPreferences.paymentNotifications",
                    checked
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationPreferences.reviewNotifications">
                  Review Notifications
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications for new reviews
                </p>
              </div>
              <Switch
                id="notificationPreferences.reviewNotifications"
                checked={sellerData.notificationPreferences.reviewNotifications}
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "notificationPreferences.reviewNotifications",
                    checked
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationPreferences.marketingUpdates">
                  Marketing Updates
                </Label>
                <p className="text-sm text-gray-500">
                  Receive marketing and promotional emails
                </p>
              </div>
              <Switch
                id="notificationPreferences.marketingUpdates"
                checked={sellerData.notificationPreferences.marketingUpdates}
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "notificationPreferences.marketingUpdates",
                    checked
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notificationPreferences.systemUpdates">
                  System Updates
                </Label>
                <p className="text-sm text-gray-500">
                  Receive important system updates
                </p>
              </div>
              <Switch
                id="notificationPreferences.systemUpdates"
                checked={sellerData.notificationPreferences.systemUpdates}
                onCheckedChange={(checked) =>
                  handleSwitchChange(
                    "notificationPreferences.systemUpdates",
                    checked
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant={"secondary"} type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
