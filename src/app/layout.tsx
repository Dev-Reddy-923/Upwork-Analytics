import { Inter } from "next/font/google";
import "./globals.css";
import EmotionRegistry from '@/lib/emotion-cache'
import { MaterialThemeProvider } from './mui-theme-provider'

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Upwork Analytics",
  description: "Professional analytics dashboard for Upwork market intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EmotionRegistry>
          <MaterialThemeProvider>
            {children}
          </MaterialThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
