"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Edit, Trash2, Star, Download, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Loading from "@/components/Loading";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";

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

interface NotificationPreferences {
  orderUpdates: boolean;
  promotionsAndDeals: boolean;
  newsletter: boolean;
  wishlistUpdates: boolean;
}

interface RecentActivity {
  title: string;
  description?: string;
  time: string;
}

interface Transaction {
  _id: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  transactionId: string;
  productName?: string;
  description?: string;
}

interface CustomerInterface {
  _id?: string;
  user: PopulatedUser;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  notificationPreferences?: NotificationPreferences;
  addresses?: Address[];
  orders?: string[];
  transactions?: Transaction[];
  wishlist?: string[];
  coupons?: string[];
  recent_activities?: RecentActivity[];
}

const fetchCustomerProfile = async (userId: string): Promise<CustomerInterface | null> => {
  try {
    const response = await axiosInstance(`/customer/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch customer profile:", error);
    return null;
  }
};

const AddressDialog = ({
  onOpenChange,
  onSave,
  initialAddress
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (address: Address) => Promise<void>;
  initialAddress: Address;
}) => {
  const [address, setAddress] = useState<Address>(initialAddress);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(address);
      onOpenChange(false);
      toast('Address saved successfully')
    } catch (error) {
      console.log("Failed to save address:", error);
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{initialAddress.street ? "Edit Address" : "Add New Address"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Address Type</Label>
          <Select
            value={address.type}
            onValueChange={(value) => setAddress(prev => ({ ...prev, type: value as "Home" | "Work" | "Other" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            placeholder="123 Main Street"
            value={address.street || ""}
            onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="New York"
              value={address.city || ""}
              onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="Dhaka"
              value={address.state || ""}
              onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              placeholder="3500"
              value={address.zipCode || ""}
              onChange={(e) => setAddress(prev => ({ ...prev, zipCode: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="United States"
              value={address.country || ""}
              onChange={(e) => setAddress(prev => ({ ...prev, country: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={address.isDefault || false}
            onChange={(e) => setAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
          />
          <Label htmlFor="isDefault" className="text-sm">
            Set as default address
          </Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-secondary text-white" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Address"}
        </Button>
      </div>
    </DialogContent>
  );
};

export default function ProfilePage() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerInterface | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    email: ""
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    promotionsAndDeals: false,
    newsletter: false,
    wishlistUpdates: true
  });

  const emptyAddress: Address = {
    type: "Home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false
  };

  const [currentAddress, setCurrentAddress] = useState<Address>(emptyAddress);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = session?.user?.id;
      if (userId) {
        const profile = await fetchCustomerProfile(userId);
        if (profile) {
          setCustomer(profile);
          setPersonalInfo({
            firstName: profile.firstName || profile.user.name?.split(" ")[0] || "",
            lastName: profile.lastName || profile.user.name?.split(" ")[1] || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            email: profile.user.email || ""
          });
          setNotificationPrefs({
            orderUpdates: profile.notificationPreferences?.orderUpdates ?? true,
            promotionsAndDeals: profile.notificationPreferences?.promotionsAndDeals ?? false,
            newsletter: profile.notificationPreferences?.newsletter ?? false,
            wishlistUpdates: profile.notificationPreferences?.wishlistUpdates ?? true
          });
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [session?.user?.id]);

  const handleUpdateCustomer = async (updates: Partial<CustomerInterface>) => {
    if (!session?.user.id) return;
    try {
      setIsSaving(true);
      const response = await axiosInstance.put(`/customer/${session.user.id}`, updates);
      setCustomer(response.data);
      toast('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to update profile');
      console.error("Failed to update customer:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePersonalInfo = async () => {
    await handleUpdateCustomer({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phone: personalInfo.phone,
      bio: personalInfo.bio
    });
  };

  const handleSaveNotificationPrefs = async () => {
    await handleUpdateCustomer({
      notificationPreferences: notificationPrefs
    });
  };

  const handleAddOrUpdateAddress = async (address: Address) => {
    let updatedAddresses = [...(customer?.addresses || [])];
    
    if (editingAddressIndex !== null) {
      updatedAddresses[editingAddressIndex] = address;
    } else {
      updatedAddresses.push(address);
    }

    if (address.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr === address
      }));
    }

    const updatedCustomer = await handleUpdateCustomer({
      addresses: updatedAddresses
    });

    setCustomer(updatedCustomer || customer);
    setEditingAddressIndex(null);
    setCurrentAddress(emptyAddress);
  };

  const handleEditAddress = (index: number) => {
    setEditingAddressIndex(index);
    setCurrentAddress(customer?.addresses?.[index] || emptyAddress);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async (index: number) => {
    if (!customer?.addresses) return;
    
    const updatedAddresses = [...customer.addresses];
    updatedAddresses.splice(index, 1);

    try {
      const updatedCustomer = await handleUpdateCustomer({
        addresses: updatedAddresses
      });
      setCustomer(updatedCustomer || customer);
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  const handleSetDefaultAddress = async (index: number) => {
    if (!customer?.addresses) return;
    
    const updatedAddresses = customer.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }));

    try {
      const updatedCustomer = await handleUpdateCustomer({
        addresses: updatedAddresses
      });
      setCustomer(updatedCustomer || customer);
    } catch (error) {
      console.error("Failed to set default address:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!customer) {
    return (
      <div className="p-6 pb-12 min-h-screen">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Unable to load profile data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-12 min-h-screen">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your account settings and preferences.
      </p>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4 h-full p-1">
          <TabsTrigger className="py-2" value="personal">
            Personal
          </TabsTrigger>
          <TabsTrigger className="py-2" value="address">
            Address
          </TabsTrigger>
          <TabsTrigger className="py-2" value="transactions">
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* PERSONAL TAB */}
        <TabsContent value="personal">
          <Card className="bg-gray-50 shadow-none border-none p-0 m-0">
            <CardContent className="space-y-6 m-0 p-0">
              {/* Personal Information */}
              <div className="p-8 bg-white rounded-sm shadow-sm border">
                <h2 className="font-semibold mb-1 text-xl">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Update your personal details.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      placeholder="Email"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      placeholder="Phone"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSavePersonalInfo}
                    className="bg-secondary text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="p-8 bg-white rounded-sm shadow-sm border">
                <h2 className="font-semibold mb-1 mt-8 text-xl">
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Manage how you receive notifications.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="orderUpdates">Order Updates</Label>
                    <Switch
                      id="orderUpdates"
                      className="data-[state=checked]:bg-secondary"
                      checked={notificationPrefs.orderUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, orderUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="promotionsAndDeals">Promotions and deals</Label>
                    <Switch
                      id="promotionsAndDeals"
                      className="data-[state=checked]:bg-secondary"
                      checked={notificationPrefs.promotionsAndDeals}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, promotionsAndDeals: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between border-b pb-3">
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <Switch
                      id="newsletter"
                      className="data-[state=checked]:bg-secondary"
                      checked={notificationPrefs.newsletter}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, newsletter: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="wishlistUpdates">Wishlist updates</Label>
                    <Switch
                      id="wishlistUpdates"
                      className="data-[state=checked]:bg-secondary"
                      checked={notificationPrefs.wishlistUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationPrefs(prev => ({ ...prev, wishlistUpdates: checked }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSaveNotificationPrefs}
                    className="bg-secondary text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADDRESS TAB */}
        <TabsContent value="address">
          <Card>
            <CardContent className="p-4 px-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="font-semibold mb-1 text-xl">Addresses</h2>
                  <p className="text-sm text-gray-500">
                    Manage your shipping and billing addresses.
                  </p>
                </div>
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-secondary text-white"
                      onClick={() => {
                        setEditingAddressIndex(null);
                        setCurrentAddress(emptyAddress);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <AddressDialog
                    open={isAddressModalOpen}
                    onOpenChange={setIsAddressModalOpen}
                    onSave={handleAddOrUpdateAddress}
                    initialAddress={currentAddress}
                  />
                </Dialog>
              </div>

              <div className="space-y-4">
                {customer.addresses && customer.addresses.length > 0 ? (
                  customer.addresses.map((address, index) => (
                    <div key={index} className="border p-4 rounded-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{address.type || "Address"}</span>
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {[
                          address.street,
                          address.city,
                          address.state,
                          address.zipCode,
                          address.country
                        ].filter(Boolean).join(", ")}
                      </p>
                      <div className="flex gap-2 text-sm">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAddress(index)}
                        >
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAddress(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                        <Button 
                          variant={address.isDefault ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSetDefaultAddress(index)}
                          disabled={address.isDefault}
                          className={address.isDefault ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          <Star className="w-3 h-3 mr-1" /> 
                          {address.isDefault ? "Default" : "Set as Default"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No addresses found.</p>
                    <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="mt-2 bg-secondary text-white"
                          onClick={() => {
                            setEditingAddressIndex(null);
                            setCurrentAddress(emptyAddress);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <AddressDialog
                        open={isAddressModalOpen}
                        onOpenChange={setIsAddressModalOpen}
                        onSave={handleAddOrUpdateAddress}
                        initialAddress={currentAddress}
                      />
                    </Dialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions">
          <Card>
            <CardContent className="p-4 px-8">
              <h2 className="font-semibold mb-1 text-xl">
                Payment Transactions
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Track your payments and download receipts. All transactions are
                securely processed via XYZ gateway.
              </p>

              <div className="space-y-3">
                {customer.transactions && customer.transactions.length > 0 ? (
                  customer.transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="border p-4 rounded-sm flex flex-col md:flex-row justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {transaction.productName || transaction.description || "Transaction"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Transaction ID: {transaction.transactionId}
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="font-semibold text-base">
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
                        <span
                          className={`px-2 py-0.5 text-sm rounded-sm w-fit ${
                            transaction.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : transaction.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" /> Download Receipt
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transactions found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}