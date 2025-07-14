"use client";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

const UnauthorizedSellerPage = () => {
  return (
    <div className="flex items-center justify-center p-4 ">
      <Card className="w-full max-w-md bg-transparent border-none shadow-none">
        <CardHeader>
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <ShieldAlert className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-semibold text-center">Seller Access Required</h1>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              You don&apos;t have seller privileges yet. To access seller features, please register as a seller.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button variant={"secondary"} className="w-full">
              <a href="/customer/become-a-seller">Become a Seller</a>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => redirect("/")}>
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedSellerPage;