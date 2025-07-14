"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-center">
              Something went wrong
            </h1>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We encountered an unexpected error. Please try again or contact
              support if the problem persists.
            </p>
            {error?.message && (
              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500 mb-4">
                <p className="font-medium">Error details:</p>
                <p>{error.message}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Button onClick={() => reset()} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => redirect("/")}
              asChild
            >
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
