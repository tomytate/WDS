import { ImageResponse } from "next/og"
import { findProductBySlug } from "@wongdigital/db/storefront"
import { siteConfig } from "@/lib/site"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductOG({ params }: Props) {
  const { slug } = await params
  const product = await findProductBySlug(slug)

  if (!product) {
    return new Response("Not found", { status: 404 })
  }

  // A visually striking layout that matches the storefront themes
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#0A0F1A",
          backgroundImage:
            "linear-gradient(135deg, rgba(30,58,138,0.6) 0%, rgba(10,15,26,1) 50%, rgba(10,15,26,1) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "80px",
            height: "100%",
            width: "100%",
          }}
        >
          {/* Top section: Store Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#3B82F6",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {siteConfig.name}
            </div>
          </div>

          {/* Center Content: Product Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {product.iconUrl && (
              <div
                style={{
                  display: "flex",
                  width: 120,
                  height: 120,
                  borderRadius: 30,
                  overflow: "hidden",
                  boxShadow: "0 0 40px rgba(59, 130, 246, 0.4)",
                  border: "2px solid rgba(248, 250, 252, 0.2)",
                  background: "#F8FAFC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Fallback styling for images loading correctly */}
                <img
                  src={product.iconUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <h1
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#F8FAFC",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  padding: 0,
                }}
              >
                {product.name}
              </h1>
              <div
                style={{
                  fontSize: 36,
                  color: "#3B82F6",
                  fontWeight: 600,
                }}
              >
                {product.category.toUpperCase()}
              </div>
            </div>
            
            {product.description && (
              <p
                style={{
                  fontSize: 28,
                  color: "rgba(248, 250, 252, 0.7)",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: "80%",
                  textOverflow: "ellipsis",
                }}
              >
                {product.description}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "16px 32px",
                background: "#F8FAFC",
                color: "#0A0F1A",
                borderRadius: "100px",
                fontSize: 28,
                fontWeight: 700,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              Order Now at {siteConfig.shortName}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
