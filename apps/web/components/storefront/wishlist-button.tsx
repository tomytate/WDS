"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

type WishlistButtonProps = {
  productId: string;
  className?: string;
  size?: number;
};

export function WishlistButton({
  productId,
  className = "",
  size = 20,
}: WishlistButtonProps) {
  const { toggle, has } = useWishlist();

  // To avoid hydration mismatch, check if window exists.
  // The hook returns empty array for SSR snapshot but client matches it on first render,
  // then updates. `isWished` is safely reactive via useSyncExternalStore.
  const isWished = has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg-surface)_60%,transparent)] p-2 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
      aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={`transition-colors duration-300 ${isWished ? "fill-[--color-danger] text-[--color-danger]" : "fill-transparent text-[--text-secondary]"}`}
        strokeWidth={isWished ? 1.5 : 2}
      />
    </button>
  );
}
