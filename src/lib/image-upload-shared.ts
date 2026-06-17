/** 客户端/服务端共用的图片上传校验（不含 Node fs） */

export const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

export function imageExtFromFile(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXT.has(fromName)) return fromName === "jpeg" ? "jpg" : fromName;

  const mime = file.type.toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return null;
}

export function validateImageFile(file: File): string | null {
  const ext = imageExtFromFile(file);
  if (!ext) return "仅支持 JPG、PNG、WebP、GIF、SVG";
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) return "图片不能超过 8MB";
  return null;
}
