import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CampusFlow",
    template: "%s | CampusFlow",
  },
  description:
    "CampusFlow helps students manage deadlines, notices, study plans, attendance, placements, and reminders from one dashboard.",
  applicationName: "CampusFlow",
  keywords: ["students", "productivity", "tasks", "study planner"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", onest.variable, "font-sans")}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
