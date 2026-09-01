import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg,#071a44,#1559b8)",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 42, width: 208, height: 120, borderRadius: 72, background: "white" }} />
          <div style={{ position: "absolute", top: 76, width: 40, height: 92, borderRadius: 10, background: "#24c6bd" }} />
          <div style={{ position: "absolute", top: 102, width: 96, height: 40, borderRadius: 10, background: "#24c6bd" }} />
          <div style={{ position: "absolute", bottom: 52, left: 44, width: 139, height: 142, borderRadius: "18px 18px 38px 18px", background: "white", transform: "skewY(5deg)" }} />
          <div style={{ position: "absolute", bottom: 52, right: 44, width: 139, height: 142, borderRadius: "18px 18px 18px 38px", background: "#dff7ff", transform: "skewY(-5deg)" }} />
          <div style={{ position: "absolute", bottom: 58, width: 14, height: 134, borderRadius: 10, background: "#4f7df3" }} />
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );
}
