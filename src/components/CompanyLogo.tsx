"use client";

import { useState } from "react";

interface CompanyLogoProps {
  src: string;
  alt: string;
  initials: string;
  className?: string;
}

export default function CompanyLogo({ src, alt, initials, className = "" }: CompanyLogoProps) {
  const [error, setError] = useState(false);

  if (error) return <span>{initials}</span>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
}
