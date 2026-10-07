import { ImageResponse } from "next/og";

export const alt = "Offerhost — Dedicated Servers & Global Network Infrastructure (AS208220)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 30%, #0f2a66 0%, #060b15 45%, #03060c 100%)",
          color: "#e8eefb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 8 }}>OFFERHOST</div>
          <div style={{ fontSize: 16, letterSpacing: 6, color: "#4d8dff", marginTop: 6 }}>GLOBAL INFRASTRUCTURE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
          <span>High-Performance Dedicated Servers</span>
          <span>
            Built on Our&nbsp;<span style={{ color: "#4d8dff" }}>Own Network</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 24, color: "#8d9ab3" }}>
          <span style={{ color: "#38d6ff" }}>AS208220</span>
          <span>RIPE NCC</span>
          <span>OFFERHOST GLOBAL NETWORK</span>
        </div>
      </div>
    ),
    size,
  );
}
