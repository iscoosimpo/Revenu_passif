import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { CartProvider } from "@/contexts/CartContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Mastery | Livre pour parler anglais",
  description:
    "Le livre English Mastery pour aider les francophones a parler anglais avec confiance.",
  metadataBase: new URL("https://english-mastery-book.com"),
  openGraph: {
    title: "English Mastery | Livre pour parler anglais",
    description:
      "Une methode claire et pratique pour apprendre l anglais grace a un livre concu pour les francophones.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <CartProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
