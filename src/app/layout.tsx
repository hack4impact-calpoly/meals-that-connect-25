import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/shared/Navbar";

// metadata
export const metadata: Metadata = {
  title: "Meals That Connect",
  description: "Meals That Connect",
  icons: {
    icon: "/MTC_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="flex flex-col h-full bg-light-gray">
          <header>
            <Navbar />
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
