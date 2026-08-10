import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { LanguageProvider } from "@/components/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe Cursor Buenos Aires #4 | Obtén tu crédito gratuito",
  description: "Regístrate para obtener tu crédito gratuito de Cursor en Cafe Cursor Buenos Aires #4.",
  keywords: ["cursor", "ide", "crédito", "desarrolladores", "programación"],
  authors: [{ name: "Cafe Cursor" }],
  openGraph: {
    title: "Cafe Cursor Buenos Aires #4 | Obtén tu crédito gratuito",
    description: "Regístrate para obtener tu crédito gratuito de Cursor en Cafe Cursor Buenos Aires #4",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
