import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volerea",
  description: "Das digitale Meister-Tool für deine Spielrunde.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
