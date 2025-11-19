"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CompanyLogoProps = {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
};

export function CompanyLogo({
  src,
  alt,
  size = 160,
  className,
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !src || hasError;
  const logoSrc = showFallback ? "/placeholder-logo.svg" : (src as string);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3",
        className
      )}
      style={{
        width: size,
        height: size / 4,
      }}
    >
      <Image
        src={logoSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        onError={() => setHasError(true)}
        priority={false}
      />
    </div>
  );
}

