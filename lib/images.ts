import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getStorage } from "./storage";

export const MAX_IMAGE_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/**
 * Re-encodes an uploaded image on the server: fixes EXIF rotation, strips all
 * metadata (including GPS), caps the longest edge at 1600px and stores WebP.
 * The browser already compresses before upload; this is the trusted pass.
 */
export async function storeImage(input: Buffer, folder: string) {
  const { data, info } = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(MAX_IMAGE_EDGE, MAX_IMAGE_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer({ resolveWithObject: true });

  const key = `${folder}/${randomUUID()}.webp`;
  await getStorage().put(key, data, "image/webp");
  return { key, width: info.width, height: info.height };
}
