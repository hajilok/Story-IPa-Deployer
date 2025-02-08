import type { Metadata } from "next";
import "./globals.css";
import { PropsWithChildren } from "react";
import Web3Providers from "./handleWeb3";

export const metadata: Metadata = {
  title: "ChatBot Ai Agent",
  description: "Story Protocol ChatBot Ai Agent",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}
