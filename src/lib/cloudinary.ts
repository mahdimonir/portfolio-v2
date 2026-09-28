import { v2 as cloudinary } from "cloudinary";

export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "devmahdi",
    api_key: process.env.CLOUDINARY_API_KEY || "488615639767111",
    api_secret: process.env.CLOUDINARY_API_SECRET || "hBrLikC6ERomZ2PE7JffKRTahSg",
    secure: true,
  });
  return cloudinary;
}

/**
 * Extracts the full public_id (including folder path) from a Cloudinary URL.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const afterUpload = parts.slice(1).join("/upload/").split("?")[0].split("#")[0];
  const segments = afterUpload.split("/");
  const cleanSegments: string[] = [];
  let foundVersionOrStart = false;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!foundVersionOrStart) {
      if (/^v\d+$/.test(seg)) {
        foundVersionOrStart = true;
        continue;
      }
      if (seg.includes(",") || /^[a-z]_[a-z0-9]+$/i.test(seg)) {
        continue;
      }
      foundVersionOrStart = true;
      cleanSegments.push(seg);
    } else {
      cleanSegments.push(seg);
    }
  }
  const path = cleanSegments.join("/");
  const lastDot = path.lastIndexOf(".");
  return lastDot > 0 ? path.substring(0, lastDot) : path;
}

/**
 * Deletes a file from Cloudinary given its URL or public_id.
 */
export async function deleteFromCloudinary(urlOrPublicId: string) {
  if (!urlOrPublicId) return { result: "skipped" };
  const publicId = urlOrPublicId.includes("cloudinary.com")
    ? extractCloudinaryPublicId(urlOrPublicId)
    : urlOrPublicId;
  if (!publicId) return { result: "invalid_id" };

  const c = getCloudinary();
  try {
    const res = await c.uploader.destroy(publicId, { invalidate: true });
    return res;
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
}

export default cloudinary;
