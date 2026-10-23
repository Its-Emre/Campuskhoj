import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Item photos live on Cloudinary in production so they survive redeploys —
// hosts like Render have an ephemeral disk, where locally saved files are
// wiped on every deploy. When the Cloudinary env vars are not set (quick
// local testing), uploads fall back to server/uploads/ on local disk.
//
// Env vars are read lazily inside the functions below (not at import time)
// because dotenv.config() runs after imports in src/index.js.

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload an in-memory image buffer to Cloudinary; resolves to its
// public secure URL.
function uploadImageBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campuskhoj", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Store one uploaded item photo (a multer memory-storage file) and return
// the URL/path to save on the item: a Cloudinary URL in production, or a
// local /uploads/<filename> path as the development fallback.
export async function storeItemImage(file) {
  if (isCloudinaryConfigured()) {
    ensureConfigured();
    return uploadImageBuffer(file.buffer);
  }

  const uploadDir = path.join(__dirname, "..", "..", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${unique}${path.extname(file.originalname).toLowerCase()}`;
  await fs.writeFile(path.join(uploadDir, filename), file.buffer);
  return `/uploads/${filename}`;
}

export default cloudinary;
