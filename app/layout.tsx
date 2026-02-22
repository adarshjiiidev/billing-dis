import { Inter } from "next/font/google";
import TopNav from "./components/TopNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Daddy's Backend",
  description: "School Billing and Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen bg-background`}>
        <TopNav />
        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
