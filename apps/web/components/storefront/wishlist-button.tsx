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
  size = 14,
}: WishlistButtonProps) {
  const { toggle, has } = useWishlist();

  const isWished = has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`relative z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-[--radius-inner] border border-[--border] bg-[--bg-base] text-[--text-muted] transition-colors duration-200 hover:border-[--text-primary] hover:text-[--color-danger-text] active:scale-95 ${className}`}
      aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${
          isWished
            ? "fill-[--color-danger] text-[--color-danger]"
            : "fill-transparent"
        }`}
        strokeWidth={isWished ? 1.5 : 2}
      />
    </button>
  );
}
