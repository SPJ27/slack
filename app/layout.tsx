import { Lato } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Providers } from "./provider";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata = {
  title: "Slack",
  description: "A Slack Clone",
  icons: {
    icon: "/image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.className} h-full`}>
      <head></head>
      <body className="h-full">
        <Providers>
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <div className="flex-1">
            <TopBar />
            {children}
          </div>
        </div>
        </Providers>
      </body>
    </html>
  );
}
