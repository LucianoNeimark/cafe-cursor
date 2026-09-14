import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { LanguageProvider } from "@/components/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grok Bot Meetup Buenos Aires | Obtén tu crédito de Grok",
  description: "Regístrate para obtener tu crédito de Grok en el Grok Bot Meetup Buenos Aires, un evento de SpaceXAI.",
  keywords: ["grok", "spacexai", "meetup", "crédito", "buenos aires"],
  authors: [{ name: "SpaceXAI" }],
  openGraph: {
    title: "Grok Bot Meetup Buenos Aires | Obtén tu crédito de Grok",
    description: "Regístrate para obtener tu crédito de Grok en el Grok Bot Meetup Buenos Aires, un evento de SpaceXAI.",
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
