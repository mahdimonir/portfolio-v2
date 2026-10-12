import { NextRequest, NextResponse } from "next/server";
import { getCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super_secret_portfolio_jwt_key_2026_secure"
);

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const cloudinary = getCloudinary();

    const folder = (formData.get("folder") as string) || "portfolio-uploads";

    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    // If an oldUrl / replaceUrl was provided, delete the previous Cloudinary asset
    const oldUrl =
      (formData.get("oldUrl") as string | null) ||
      (formData.get("replaceUrl") as string | null) ||
      (formData.get("previousUrl") as string | null);

    let deletedOldResult: any = null;
    if (oldUrl && typeof oldUrl === "string" && oldUrl.includes("cloudinary.com")) {
      try {
        deletedOldResult = await deleteFromCloudinary(oldUrl);
      } catch (delErr) {
        console.warn("Failed to delete previous Cloudinary asset:", delErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
      deletedOld: deletedOldResult,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image to Cloudinary" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const targets: string[] = [];

    // Query param ?url=... or ?publicId=...
    const { searchParams } = new URL(request.url);
    const queryUrl = searchParams.get("url") || searchParams.get("publicId");
    if (queryUrl) targets.push(queryUrl);

    // JSON body { url, urls, publicId }
    try {
      const body = await request.json();
      if (body.url && typeof body.url === "string") targets.push(body.url);
      if (body.publicId && typeof body.publicId === "string") targets.push(body.publicId);
      if (Array.isArray(body.urls)) {
        targets.push(...body.urls.filter((u: any) => typeof u === "string"));
      }
    } catch {
      // Body may be empty if query params were used
    }

    const uniqueTargets = Array.from(new Set(targets.filter(Boolean)));
    if (uniqueTargets.length === 0) {
      return NextResponse.json(
        { error: "No image URL or publicId provided for deletion" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      uniqueTargets.map(async (item) => {
        try {
          const res = await deleteFromCloudinary(item);
          return { target: item, ...res };
        } catch (err: any) {
          return { target: item, error: err.message || "Failed to delete" };
        }
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Cloudinary delete route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete image from Cloudinary" },
      { status: 500 }
    );
  }
}
