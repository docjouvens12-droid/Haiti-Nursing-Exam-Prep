import { ImageResponse } from "next/og";
import { HN_ICON_SVG } from "@/lib/hn-icon-svg";

export const runtime = "edge";

/** Android icon generated from the approved HN stethoscope and cap symbol. */
export async function GET() {
  const artwork = `data:image/svg+xml;base64,${btoa(Array.from(new TextEncoder().encode(HN_ICON_SVG), (byte) => String.fromCharCode(byte)).join(''))}`;
  return new ImageResponse(
    <div style={{display:"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",background:"#071c55"}}>
      <img src={artwork} alt="Haiti Nursing Exam Prep" width="512" height="512" />
    </div>,
    {width:512,height:512,headers:{"Cache-Control":"public, max-age=3600"}}
  );
}
