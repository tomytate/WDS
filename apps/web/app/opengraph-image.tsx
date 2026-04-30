import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/site"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0F1A",
          backgroundImage:
            "linear-gradient(to bottom right, #0A0F1A 0%, #172554 50%, #1E40AF 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
            background: "rgba(238, 238, 238, 0.1)",
            padding: "20px 40px",
            borderRadius: "100px",
            border: "1px solid rgba(238, 238, 238, 0.2)",
          }}
        >
          <span
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: "#F8FAFC",
              letterSpacing: "-0.02em",
            }}
          >
            {siteConfig.name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 40,
            color: "#3B82F6",
            fontWeight: 700,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {siteConfig.tagline}
        </div>
        
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "rgba(248, 250, 252, 0.7)",
            maxWidth: "800px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
