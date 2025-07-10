  "use client";

  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Card, CardContent } from "@/components/ui/card";
  import { MapPin, Edit, Trash2, Star, Download } from "lucide-react";
  import { Switch } from "@/components/ui/switch";
  import { useSession } from "next-auth/react";
  import { useEffect, useState } from "react";

  interface User {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    id?: string;
  }

  export default function ProfilePage() {
    const [user, setUser] = useState<Partial<User>>({});
    const { data: session } = useSession();
    useEffect(() => {
      if (session?.user) {
        setUser(session?.user as Partial<User>);
      }
    }, [session?.user])
    return (
      <div className="p-6 pb-12 min-h-screen">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Manage your account settings and preferences.
        </p>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4 h-full p-1">
            <TabsTrigger className="py-2" value="personal">Personal</TabsTrigger>
            <TabsTrigger className="py-2" value="address">Address</TabsTrigger>
            <TabsTrigger className="py-2" value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* PERSONAL TAB */}
          <TabsContent value="personal">
            <Card  className="bg-gray-50 shadow-none border-none p-0 m-0">
              <CardContent className="space-y-6 m-0 p-0">
                {/* Personal Information */}
                <div className="p-8 bg-white rounded-md shadow-sm border">
                  <h2 className=" font-semibold mb-1 text-xl">Personal Information</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your personal details.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First name
                      </label>
                      <input
                        className="border rounded-sm px-2 py-1  w-full"
                        placeholder="First name"
                        defaultValue={user.name?.split(" ")[0] || "No name provided"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last name
                      </label>
                      <input
                        className="border rounded-sm px-2 py-1  w-full"
                        placeholder="Last name"
                        defaultValue={user.name?.split(" ")[1] || "No name provided"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        className="border rounded-sm px-2 py-1  w-full"
                        placeholder="Email"
                        defaultValue={user.email || "No email provided"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        className="border rounded-sm px-2 py-1  w-full"
                        placeholder="Phone"
                        defaultValue="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      className="w-full border rounded-sm px-2 py-1 "
                      rows={3}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  <div className="flex justify-between mt-6">
                    <button className="flex items-center gap-1 border px-4 py-2 rounded-sm ">
                      <span className="material-icons text-base">close</span>
                      Cancel
                    </button>
                    <button className="bg-secondary text-white px-4 py-2 rounded-sm ">
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="p-8 bg-white rounded-md shadow-sm border ">
                  <h2 className=" font-semibold mb-1 mt-8 text-xl">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Manage how you receive notifications.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="">Order Updates</span>
                      <Switch
                        className="data-[state=checked]:bg-secondary"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="">Promotions and deals</span>
                      <Switch
                        className="data-[state=checked]:bg-secondary"
                        defaultChecked={false}
                      />
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="">Newsletter</span>
                      <Switch
                        className="data-[state=checked]:bg-secondary"
                        defaultChecked={false}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="">Wishlist updates</span>
                      <Switch
                        className="data-[state=checked]:bg-secondary"
                        defaultChecked
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button className="bg-secondary text-white px-4 py-2 rounded-sm ">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADDRESS TAB */}
          <TabsContent value="address">
            <Card>
              <CardContent className="p-4 px-8">
                <h2 className=" font-semibold mb-1 text-xl">Addresses</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Manage your shipping and billing addresses.
                </p>

                <div className="space-y-4">
                  {/* Home Address */}
                  <div className="border p-4 rounded-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium ">Home</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      12 Rosewood Lane, Flat 3A, Manchester, M14 5TR, United
                      Kingdom
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 border rounded-sm">
                        <Edit className="w-3 h-3" /> Edit
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 border rounded-sm text-red-500">
                        <Trash2 className="w-3 h-3" /> Delete
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-sm text-yellow-500">
                        <Star className="w-3 h-3" /> Default
                      </span>
                    </div>
                  </div>

                  {/* Work Address */}
                  <div className="border p-4 rounded-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium ">Work</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Unit 7, Orion Business Park, Slough, SL1 4QT, UK
                    </p>
                    <div className="flex gap-2 text-sm">
                      <span className="flex items-center gap-1 px-2 py-1 border rounded-sm">
                        <Edit className="w-3 h-3" /> Edit
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 border rounded-sm text-red-500">
                        <Trash2 className="w-3 h-3" /> Delete
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-sm text-gray-500">
                        <Star className="w-3 h-3" /> Set as Default
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRANSACTIONS TAB */}
          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-4 px-8">
                <h2 className=" font-semibold mb-1 text-xl">Payment Transactions</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Track your payments and download receipts. All transactions are securely processed via XYZ gateway.
                </p>

                <div className="space-y-3">
                  {["Paid", "Pending", "Failed"].map((status) => (
                    <div
                      key={status}
                      className="border p-4 rounded-sm flex flex-col md:flex-row justify-between"
                    >
                      <div>
                        <div className="font-medium ">Wireless Headphones</div>
                        <div className="text-sm text-gray-500">
                          Transaction ID: TXN-453229
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                          May 16, 2023
                        </div>
                        <div className="font-semibold text-base">$249.99</div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2 mt-2 md:mt-0">
                        <span
                          className={`px-2 py-0.5 text-sm rounded-sm w-fit ${
                            status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {status}
                        </span>
                        <span className="flex items-center gap-1 px-4 py-2 cursor-pointer border rounded-sm text-sm">
                          <Download className="h-3 w-3" /> Download Receipt
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
