import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve) => {
    cloudinary.uploader
      .upload_stream({ folder: "your-folder-name" }, (error, result) => {
        if (error) {
          resolve(
            NextResponse.json({ error: error.message }, { status: 500 })
          );
        } else {
          resolve(NextResponse.json({ url: result?.secure_url }, { status: 200 }));
        }
      })
      .end(buffer);
  });
}
