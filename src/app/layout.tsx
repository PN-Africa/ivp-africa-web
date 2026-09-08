import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// We combine all SEO tags into a single metadata export
export const metadata: Metadata = {
  title: "IVP Africa | Talent Placement Platform",
  description: "Connecting qualified talent with employers across Africa.",
  keywords: "IVP Africa, talent placement, jobs, Africa",
  alternates: {
    canonical: "",
  },
  openGraph: {
    title: "IVP Africa | Talent Placement Platform",
    description: "Connecting qualified talent with employers across Africa.",
    url: " ",
    type: "website",
    images: [
      {
        url: "", // Add your OG image URL here
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IVP Africa | Talent Placement Platform",
    description: "Connecting qualified talent with employers across Africa.",
    images: [""], // Add your Twitter image URL here
  },
  icons: {
    icon: "/assets/logo6.png",
  },
};

// We only need one RootLayout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`lg:h-full antialiased ${manrope.className} ${plusJakartaSans.className}`}>
      <body className="flex flex-col font-sans lg:min-h-full">
        {children}
      </body>
    </html>
  );
}