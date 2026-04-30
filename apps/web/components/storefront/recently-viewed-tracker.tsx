"use client";

import { useEffect } from "react";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

/**
 * Invisible component that records a product view when mounted.
 * Drop into any page that displays a single product.
 */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  const { track } = useRecentlyViewed();

  useEffect(() => {
    track(slug);
  }, [slug, track]);

  return null;
}
