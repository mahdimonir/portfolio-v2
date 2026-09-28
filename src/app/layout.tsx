import type { Metadata } from "next";
import { playfair, inter } from "@/lib/fonts";
import "./globals.css";
import "lenis/dist/lenis.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Moniruzzaman Mahdi — Full Stack Developer",
  description:
    "Portfolio of Moniruzzaman Mahdi — crafting scroll-driven, pixel-perfect web experiences using React, TypeScript, and modern UI.",
  metadataBase: new URL("https://mahdi.dev"),
  openGraph: {
    type: "website",
    url: "https://mahdi.dev",
    title: "Moniruzzaman Mahdi — Full Stack Developer",
    description:
      "Scroll-driven, cinematic web experiences. React • TypeScript • Motion • UI Engineering.",
    images: [{ url: "/preview.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Moniruzzaman Mahdi — Full Stack Developer",
    description:
      "Scroll-driven, cinematic web experiences. React • TypeScript • Motion • UI Engineering.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
