import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wong Digital Shop",
    short_name: "Wong Digital Shop",
    description: "Your trusted Filipino digital storefront — premium subscriptions like ChatGPT Pro, Canva Pro, Spotify Premium, and 30+ social media boosting services.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#D97706",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
