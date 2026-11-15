import { createHash, randomUUID } from "node:crypto";
import { validateProductModelBytes } from "@/lib/product-model";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_PRODUCT_MODEL_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_MODEL_EXTENSIONS = new Set(["glb", "gltf"]);

export class ImageStorageError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export type UploadedProductImage = {
  url: string;
  format: string;
};

export type ProductModelUploadIntent = {
  cloudName: string;
  apiKey: string;
  timestamp: string;
  assetFolder: string;
  publicId: string;
  signature: string;
};

export type UploadedProductModel = {
  url: string;
  format: "glb" | "gltf";
};

export function createProductModelUploadIntent(
  productId: string,
  filename: string,
  size: number,
): ProductModelUploadIntent {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const match = /\.([a-z0-9]+)$/i.exec(filename);
  const extension = match?.[1].toLowerCase();
  if (!extension || !ALLOWED_MODEL_EXTENSIONS.has(extension)) {
    throw new ImageStorageError("Choose a .glb model or a self-contained .gltf model.", 415);
  }
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_PRODUCT_MODEL_BYTES) {
    throw new ImageStorageError("Choose a 3D model smaller than 25 MB.", 413);
  }
  if (!/^[a-z0-9-]{1,100}$/i.test(productId)) {
    throw new ImageStorageError("Product not found.", 404);
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const assetFolder = `digital-closet/models/${productId}`;
  const publicId = `${assetFolder}/${randomUUID()}.${extension}`;
  const parameters = { asset_folder: assetFolder, public_id: publicId, timestamp };
  return {
    cloudName,
    apiKey,
    timestamp,
    assetFolder,
    publicId,
    signature: signCloudinaryParameters(parameters, apiSecret),
  };
}

export async function finalizeProductModelUpload(
  productId: string,
  publicId: string,
  version: number,
): Promise<UploadedProductModel> {
  const { cloudName } = getCloudinaryConfig();
  const prefix = `digital-closet/models/${productId}/`;
  if (
    !/^[a-z0-9-]{1,100}$/i.test(productId) ||
    !publicId.startsWith(prefix) ||
    !/^[a-z0-9-]{36}\.(glb|gltf)$/i.test(publicId.slice(prefix.length)) ||
    !Number.isSafeInteger(version) ||
    version < 1
  ) {
    throw new ImageStorageError("Invalid 3D model upload. Please try uploading again.", 400);
  }

  const format = publicId.slice(publicId.lastIndexOf(".") + 1).toLowerCase() as "glb" | "gltf";
  const url = `https://res.cloudinary.com/${cloudName}/raw/upload/v${version}/${publicId}`;
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
  } catch (error) {
    console.error("Cloudinary model verification request failed", error);
    throw new ImageStorageError("The uploaded 3D model could not be verified.", 502);
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new ImageStorageError("The uploaded 3D model could not be verified. Please try again.", 422);
  }

  const contentLengthHeader = response.headers.get("content-length");
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader);
    if (!Number.isSafeInteger(contentLength) || contentLength < 1 || contentLength > MAX_PRODUCT_MODEL_BYTES) {
      await response.body?.cancel();
      throw new ImageStorageError("The 3D model must be smaller than 25 MB.", 413);
    }
  }
  const bytes = await readBoundedModelResponse(response);
  const validationError = validateProductModelBytes(bytes, format);
  if (validationError) throw new ImageStorageError(validationError, 415);
  return { url, format };
}

export async function uploadProductImage(file: File): Promise<UploadedProductImage> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  await validateProductImage(file);

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "digital-closet/products";
  const publicId = randomUUID();
  const parameters = { folder, public_id: publicId, timestamp };
  const toSign = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");

  const form = new FormData();
  form.set("file", file);
  form.set("api_key", apiKey);
  form.set("timestamp", timestamp);
  form.set("folder", folder);
  form.set("public_id", publicId);
  form.set("signature", signature);

  let response: Response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(45_000),
    });
  } catch (error) {
    console.error("Cloudinary image upload request failed", error);
    throw new ImageStorageError("Image storage could not be reached. Please try again.", 502);
  }

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok || !isUploadedImage(result, cloudName)) {
    console.error("Cloudinary image upload rejected", { status: response.status });
    throw new ImageStorageError("The image could not be saved. Check your image settings and try again.", 502);
  }

  return { url: result.secure_url, format: result.format.toLowerCase() };
}

function signCloudinaryParameters(parameters: Record<string, string>, apiSecret: string) {
  const toSign = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

async function readBoundedModelResponse(response: Response): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) throw new ImageStorageError("The uploaded 3D model could not be verified.", 502);

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_PRODUCT_MODEL_BYTES) {
        await reader.cancel();
        throw new ImageStorageError("The 3D model must be smaller than 25 MB.", 413);
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ImageStorageError) throw error;
    console.error("Cloudinary model download failed", error);
    throw new ImageStorageError("The uploaded 3D model could not be verified.", 502);
  } finally {
    reader.releaseLock();
  }
  if (totalBytes < 1) throw new ImageStorageError("The uploaded 3D model could not be verified.", 502);

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function validateProductImage(file: File) {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new ImageStorageError("Choose an image smaller than 4 MB.", 413);
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new ImageStorageError("Use a JPG, PNG, or WebP image.", 415);
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  const webp =
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const matchesType =
    (file.type === "image/jpeg" && jpeg) ||
    (file.type === "image/png" && png) ||
    (file.type === "image/webp" && webp);
  if (!matchesType) {
    throw new ImageStorageError("The file contents do not match a supported image format.", 415);
  }
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ImageStorageError("Product image storage is not configured on this server.", 503);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName)) {
    throw new ImageStorageError("Product image storage is not configured correctly.", 503);
  }
  return { cloudName, apiKey, apiSecret };
}

function isUploadedImage(
  value: unknown,
  cloudName: string,
): value is { secure_url: string; format: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("secure_url" in value) ||
    !("format" in value) ||
    typeof value.secure_url !== "string" ||
    typeof value.format !== "string"
  ) {
    return false;
  }
  try {
    const url = new URL(value.secure_url);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(`/${cloudName}/image/upload/`) &&
      ["jpg", "jpeg", "png", "webp"].includes(value.format.toLowerCase())
    );
  } catch {
    return false;
  }
}
