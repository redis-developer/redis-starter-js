import { Space_Grotesk, Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-space-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--font-space-grotesk",
  display: "swap",
});

export { spaceMono, spaceGrotesk };

