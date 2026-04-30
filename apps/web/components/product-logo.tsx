import Image from "next/image"
import { cn } from "@wongdigital/ui"

type ProductLogoProps = {
  name: string
  iconUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
  imageClassName?: string
}

const logoSizeClasses = {
  sm: "h-16 w-16 rounded-xl text-base",
  md: "h-20 w-20 rounded-2xl text-lg",
  lg: "h-24 w-24 rounded-[26px] text-xl",
} as const

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ProductLogo({
  name,
  iconUrl,
  size = "md",
  className,
  imageClassName,
}: ProductLogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden text-[--text-primary]",
        logoSizeClasses[size],
        className,
      )}
    >
      {iconUrl ? (
        <Image
          alt={`${name} logo`}
          src={iconUrl}
          width={192}
          height={192}
          className={cn("object-contain p-1.5 h-full w-full", imageClassName)}
        />
      ) : (
        <span className="font-display">{initials(name)}</span>
      )}
    </div>
  )
}
