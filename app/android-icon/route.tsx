import { ImageResponse } from "next/og";
import HNIconArtwork from "@/components/HNIconArtwork";

export const runtime = "edge";
export async function GET() {
  return new ImageResponse(<HNIconArtwork size={512} />, {
    width:512,
    height:512,
    headers:{"Cache-Control":"public, max-age=3600"}
  });
}
