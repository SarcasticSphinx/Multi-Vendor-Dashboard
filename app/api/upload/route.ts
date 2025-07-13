import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

interface CloudinaryUploadResult {
  secure_url: string;
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "your-folder-name" }, (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error("Cloudinary upload failed"));
          }
          if (!result || typeof result.secure_url !== 'string') {
            return reject(new Error("Cloudinary did not return a valid secure URL"));
          }
          resolve(result as CloudinaryUploadResult); 
        })
        .end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url }, { status: 200 });

  } catch (error: unknown) { 
    console.error("API Upload Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Failed to upload file", error: errorMessage },
      { status: 500 }
    );
  }
}