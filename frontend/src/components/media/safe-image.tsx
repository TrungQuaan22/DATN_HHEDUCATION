"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState, type ImgHTMLAttributes } from "react";

export const IMAGE_PLACEHOLDER_URL = "https://www.w3.org/Icons/w3c_home.png";

export function getSafeImageSrc(src: string | null | undefined) {
  return src || IMAGE_PLACEHOLDER_URL;
}

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = IMAGE_PLACEHOLDER_URL,
  onError,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : src || fallbackSrc}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
}

type SafeImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function SafeImg({
  src,
  fallbackSrc = IMAGE_PLACEHOLDER_URL,
  onError,
  ...props
}: SafeImgProps) {
  const [currentSrc, setCurrentSrc] = useState(getSafeImageSrc(src));

  useEffect(() => {
    setCurrentSrc(getSafeImageSrc(src));
  }, [src]);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
