import { ImageResponse } from "next/og";

export const alt = "Mémoire, artisan French bread pre-orders in Gurgaon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6efe3",
          color: "#6d1d2b",
          border: "24px solid #6d1d2b",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 10, color: "#a8834d", textTransform: "uppercase" }}>
          Boulangerie · Gurgaon
        </div>
        <div style={{ fontSize: 150, fontStyle: "italic", fontFamily: "serif", marginTop: 10 }}>Mémoire</div>
        <div style={{ fontSize: 40, color: "#2b1d1a", marginTop: 10 }}>Pre-order tomorrow&apos;s bread, baked slow.</div>
      </div>
    ),
    size,
  );
}
