"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { Key, Loader2, LogOut, Mail, User } from "lucide-react";
import axiosInstance from "@/lib/axios";
import Loading from "@/components/Loading";
import { toast } from "react-toastify";
import uploadToCloudinary from "@/lib/cloudinary";
import { redirect } from "next/navigation";

interface NotificationPreferences {
  orderUpdates: boolean;
  promotionsAndDeals: boolean;
  newsletter: boolean;
  wishlistUpdates: boolean;
}

interface Address {
  _id: string;
  type: "Home" | "Work" | "Other";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface CustomerInterface {
  notificationPreferences?: NotificationPreferences;
  addresses?: Address[];
}

const Settings = () => {
  const { data: session, update } = useSession();
  if (!session) {
    redirect("/login");
  }
  const [customerData, setCustomerData] = useState<CustomerInterface | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!session?.user.id) return;
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/customer/${session.user.id}`
        );
        setCustomerData(response.data);
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [session?.user.id]);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    defaultShippingAddress: "",
    defaultPaymentMethod: "",
    preferredCurrency: "USD",
    darkMode: false,
    newsletter: customerData?.notificationPreferences?.newsletter || false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user.id) return;

    const file = e.target.files?.[0];
    setIsUpdating(true);
    if (file) {
      const url = await uploadToCloudinary(file);
      console.log(url);
      if (url) {
        const updatedUser = await axiosInstance.put(
          `/auth/update-profile-picture/${session?.user.id}`,
          { image: url }
        );
        if (updatedUser.status === 200) {
          toast("Profile photo updated successfully.");
        }
        await update({
          user: {
            ...session?.user,
            image: url,
          },
        });
        setIsUpdating(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password change submitted", passwordData);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast("New password and confirm password do not match.");
      return;
    }
    const FormData = {
      email: session?.user.email,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };

    if (!FormData.email || !FormData.currentPassword || !FormData.newPassword) {
      toast("Please fill in all fields.");
      return;
    }

    const updatedUser = await axiosInstance.put(
      `/auth/change-password/${session?.user.id}`,
      FormData
    );

    if (updatedUser.status === 200) {
      toast("Password updated successfully.");
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast("Failed to update password.");
    }
  };

  const handlePreferenceChange = (name: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button
          variant={"secondary"}
          onClick={() => redirect("/customer/become-a-seller")}
        >
          Become A Seller
        </Button>
      </div>

      {/* Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 flex justify-center items-center">
                {isUpdating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <AvatarImage src={session?.user?.image || undefined} />
                )}
                <AvatarFallback className="text-3xl">
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload">
                <Button variant="outline" asChild>
                  <span>{isUpdating ? "Updating Photo" : "Change Photo"}</span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <Label>Name</Label>
                <div className="text-lg font-medium mt-1">
                  {session?.user?.name || "User"}
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{session?.user?.email || "user@example.com"}</span>
                </div>
              </div>

              {!isEditingPassword ? (
                <Button
                  onClick={() => setIsEditingPassword(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Save Password</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPassword(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Default Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default Shipping Address</Label>
            <Select
              value={preferences.defaultShippingAddress}
              onValueChange={(value) =>
                handlePreferenceChange("defaultShippingAddress", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default address" />
              </SelectTrigger>
              <SelectContent>
                {customerData?.addresses?.map((address) => (
                  <SelectItem key={address._id} value={address._id}>
                    {`${address.type} - ${address.street}, ${address.city}, ${address.state}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Preferred Currency</Label>
            <Select
              value={preferences.preferredCurrency}
              onValueChange={(value) =>
                handlePreferenceChange("preferredCurrency", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-gray-500">
                Switch between light and dark theme
              </p>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) =>
                handlePreferenceChange("darkMode", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Newsletter</Label>
              <p className="text-sm text-gray-500">
                Receive our monthly newsletter
              </p>
            </div>
            <Switch
              checked={preferences.newsletter}
              onCheckedChange={(checked) =>
                handlePreferenceChange("newsletter", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <div className="flex justify-end">
        <Button
          onClick={() => signOut()}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;
