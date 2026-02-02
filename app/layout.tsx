import type { Metadata } from "next";
import { AuthSessionProvider } from "@/lib/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Occamy Field Ops",
  description: "Track field operations efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
