/**
 * High-performance Cloudinary and local image URL optimizer.
 * Automatically injects Cloudinary edge CDN transformations (f_auto, q_auto, width capping)
 * to deliver modern WebP / AVIF images, reducing file sizes by 70% to 98%.
 */

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "png" | "jpg";
  crop?: "limit" | "fill" | "fit" | "scale" | "thumb";
}

export function optimizeImageUrl(
  url?: string | null,
  options: OptimizeImageOptions = {}
): string {
  if (!url || typeof url !== "string") {
    return "/preview.png";
  }

  // If not Cloudinary, return as-is
  if (!url.includes("cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const uploadToken = "/upload/";
  const parts = url.split(uploadToken);
  if (parts.length < 2) return url;

  const prefix = parts[0] + uploadToken;
  let rest = parts.slice(1).join(uploadToken);

  // Default transformations: auto modern format (AVIF/WebP) + perceptual auto quality
  const transforms: string[] = [
    `f_${options.format || "auto"}`,
    `q_${options.quality || "auto"}`,
  ];

  if (options.width) {
    transforms.push(`w_${options.width}`);
    transforms.push(`c_${options.crop || "limit"}`);
  }

  if (options.height) {
    transforms.push(`h_${options.height}`);
  }

  const transformStr = transforms.join(",");

  // Check if first segment of rest is already a transformation segment
  const segments = rest.split("/");
  const firstSeg = segments[0] || "";

  // Cloudinary transform signature pattern
  if (
    firstSeg.includes("f_") ||
    firstSeg.includes("q_") ||
    firstSeg.includes("w_") ||
    /^[a-z]_[a-z0-9]+(,[a-z]_[a-z0-9]+)*$/i.test(firstSeg)
  ) {
    // Replace existing transformation with the newly optimized one
    segments[0] = transformStr;
    return prefix + segments.join("/");
  }

  return prefix + transformStr + "/" + rest;
}

/**
 * Generates an HTML srcSet string for Cloudinary images for responsive loading.
 */
export function getCloudinarySrcSet(
  url?: string | null,
  widths: number[] = [400, 800, 1200]
): string {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return "";
  }
  return widths
    .map((w) => `${optimizeImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
