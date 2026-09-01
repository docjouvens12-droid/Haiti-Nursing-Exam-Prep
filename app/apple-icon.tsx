import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 38,
        }}
      >
        <div style={{ width: 132, height: 132, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 14, width: 76, height: 44, borderRadius: 26, background: "white" }} />
          <div style={{ position: "absolute", top: 26, width: 15, height: 34, borderRadius: 4, background: "#24c6bd" }} />
          <div style={{ position: "absolute", top: 36, width: 35, height: 15, borderRadius: 4, background: "#24c6bd" }} />
          <div style={{ position: "absolute", bottom: 20, left: 16, width: 51, height: 52, borderRadius: "6px 6px 14px 6px", background: "white", transform: "skewY(5deg)" }} />
          <div style={{ position: "absolute", bottom: 20, right: 16, width: 51, height: 52, borderRadius: "6px 6px 6px 14px", background: "#dff7ff", transform: "skewY(-5deg)" }} />
          <div style={{ position: "absolute", bottom: 22, width: 5, height: 49, borderRadius: 4, background: "#4f7df3" }} />
        </div>
      </div>
    ),
    size
  );
}
