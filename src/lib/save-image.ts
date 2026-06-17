import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  imageExtFromFile,
  validateImageFile,
} from "@/lib/image-upload-shared";
import {
  removeLightBackgroundFromBuffer,
  shouldRemoveLightBackground,
} from "@/lib/remove-light-background";
import {
  optimizeRasterBuffer,
  writeOptimizedRasterFiles,
} from "@/lib/optimize-image";

export { IMAGE_UPLOAD_MAX_BYTES, imageExtFromFile, validateImageFile } from "@/lib/image-upload-shared";

type SaveOptions = {
  /** 自动去除白底/浅底，输出透明 PNG（适合商品图） */
  removeLightBackground?: boolean;
};

export async function saveImageToPublic(
  file: File,
  subdir: string,
  filename: string,
  options: SaveOptions = {},
): Promise<string> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const ext = imageExtFromFile(file) ?? "jpg";
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = join(process.cwd(), "public", subdir);
  await mkdir(dir, { recursive: true });

  if (ext === "svg" || ext === "gif") {
    await writeFile(join(dir, filename), bytes);
    return `/${subdir.replace(/\\/g, "/")}/${filename}`;
  }

  let rasterBytes = bytes;
  let baseName = filename.replace(/\.[^.]+$/, "");

  if (options.removeLightBackground && shouldRemoveLightBackground(ext)) {
    try {
      rasterBytes = Buffer.from(await removeLightBackgroundFromBuffer(bytes));
      baseName = filename.replace(/\.[^.]+$/, "");
    } catch {
      /* sharp 失败时继续用原图压缩 */
    }
  }

  const optimized = await optimizeRasterBuffer(rasterBytes);
  await writeOptimizedRasterFiles(dir, baseName, optimized);

  return `/${subdir.replace(/\\/g, "/")}/${baseName}.png`;
}
