"use client";
import { CreditCard, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const PaymentPage = () => {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "seller") {
      redirect("/unauthorized");
    }
  return (
    <div className="mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Payments</h1>
        <p className="text-gray-500 text-sm">
          View your payment history and transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Payment History</h2>
            <Button variant="outline" disabled>
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Your payment history will appear here once you complete
              transactions.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant={"secondary"}>
                <CreditCard className="mr-2 h-4 w-4" />
                Make a Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Payment Methods</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <p className="text-gray-500">No payment methods saved yet</p>
              <Button variant="outline" className="mt-4">
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Upcoming Payments</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <p className="text-gray-500">No upcoming payments scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
