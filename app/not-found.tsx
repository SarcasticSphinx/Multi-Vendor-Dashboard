"use client";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { redirect, useRouter } from "next/navigation";

const NotFoundPage = () => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-transparent shadow-none border-none">
        <CardHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileSearch className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-center">
              Page Not Found
            </h1>
            <p className="text-gray-500 text-sm">404 Error</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button variant={"secondary"} className="w-full" onClick={() => redirect("/")}>
              Return Home
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
            >
              Previous Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
