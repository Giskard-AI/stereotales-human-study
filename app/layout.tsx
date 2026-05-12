import type { Metadata } from "next";
import Image from "next/image";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fresnel User Study",
  description:
    "Survey on stereotypical associations in AI-generated text — Giskard AI Research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50`}>
        {children}
        <footer className="fixed bottom-4 right-5 opacity-60 hover:opacity-90 transition-opacity">
          <a
            href="https://giskard.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Image
              src="/turtle.svg"
              alt="Giskard"
              width={35}
              height={17}
              className="brightness-0 opacity-70 pt-2"
            />
            <span className="text-s font-medium text-gray-400 tracking-wide">
              Giskard AI
            </span>
          </a>
        </footer>
      </body>
    </html>
  );
}
