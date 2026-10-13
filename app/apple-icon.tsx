import { ImageResponse } from "next/og";
import HNIconArtwork from "@/components/HNIconArtwork";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<HNIconArtwork size={180} />, size);
}
