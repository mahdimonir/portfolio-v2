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

export default cloudinary;
