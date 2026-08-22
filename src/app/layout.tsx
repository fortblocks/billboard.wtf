import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Anton,
  Bebas_Neue,
  Oswald,
  Archivo_Black,
  Black_Ops_One,
  Russo_One,
  Bangers,
  Permanent_Marker,
  Playfair_Display,
  Space_Grotesk,
  Inter,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const archivo = Archivo_Black({
  weight: "400",
  variable: "--font-archivo",
  subsets: ["latin"],
});

const blackOps = Black_Ops_One({
  weight: "400",
  variable: "--font-blackops",
  subsets: ["latin"],
});

const russo = Russo_One({
  weight: "400",
  variable: "--font-russo",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

const marker = Permanent_Marker({
  weight: "400",
  variable: "--font-marker",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "billboard.wtf — One face. Rising price.",
  description:
    "A literal digital billboard. One brand on the face at a time. Price starts at $1 and climbs.",
  metadataBase: new URL("https://billboard.wtf"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        geistSans.variable,
        geistMono.variable,
        anton.variable,
        bebas.variable,
        oswald.variable,
        archivo.variable,
        blackOps.variable,
        russo.variable,
        bangers.variable,
        marker.variable,
        playfair.variable,
        space.variable,
        inter.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
