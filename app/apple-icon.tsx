import { ImageResponse } from "next/og";
import { HN_ICON_SVG } from "@/lib/hn-icon-svg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS homescreen icon uses the same official HN mark as the website. */
export default function AppleIcon() {
  const artwork = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(HN_ICON_SVG)}`;
  return new ImageResponse(
    <div style={{display:"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",background:"#071c55"}}>
      <img src={artwork} alt="Haiti Nursing Exam Prep" width="180" height="180" />
    </div>,
    size
  );
}
