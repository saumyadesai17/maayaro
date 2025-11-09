import type { Metadata } from "next";
import Script from "next/script";
import { StoreProvider } from "@/contexts/StoreContext";
import { CountsProvider } from "@/contexts/CountsContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAAYARO - Premium Fashion",
  description: "Discover timeless elegance with MAAYARO's curated collection of premium fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StoreProvider>
          <CountsProvider>
            {children}
          </CountsProvider>
        </StoreProvider>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}