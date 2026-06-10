import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lore Wrapped | Your group chat season recap",
  description:
    "Turn a group-chat excerpt into a playful, nine-part season recap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
