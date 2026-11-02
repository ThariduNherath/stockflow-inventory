import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { session } from "@/lib/auth";
const s3 = new S3Client({ region: process.env.AWS_REGION });
export async function POST(req: Request) {
  const s = await session();
  if (!s || s.role === "STAFF") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, type } = await req.json();
  if (!/^image\//.test(type)) return NextResponse.json({ error: "Images only" }, { status: 400 });
  const Key = `products/${Date.now()}-${String(name).replace(/[^\w.]/g, "_")}`;
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key, ContentType: type }), { expiresIn: 60 });
  return NextResponse.json({ url, publicUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}` });
}