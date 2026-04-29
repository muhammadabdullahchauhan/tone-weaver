"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Notification from "@/components/Notification";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEmbedView = pathname?.startsWith("/shared/") && pathname.endsWith("/embed");

  if (isEmbedView) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Notification />
    </div>
  );
}
