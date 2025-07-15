"use client"; 

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [layoutClasses, setLayoutClasses] = useState("");

  useEffect(() => {
    if (status !== "loading") {
      if (session) {
        setLayoutClasses("pl-0 md:pl-16 lg:pl-64 pt-40 lg:pr-20");
      } else {
        setLayoutClasses(
          "min-h-screen mt-20 flex items-center justify-center px-4 sm:px-30"
        );
      }
    }
  }, [session, status]);

  return <div className={layoutClasses}>{children}</div>;
}