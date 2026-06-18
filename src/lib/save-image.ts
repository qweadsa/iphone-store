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

  let output: Buffer = bytes;
  let outputName = filename;

  if (options.removeLightBackground && shouldRemoveLightBackground(ext)) {
    output = Buffer.from(await removeLightBackgroundFromBuffer(bytes));
    outputName = filename.replace(/\.[^.]+$/, ".png");
  }

  await writeFile(join(dir, outputName), output);

  return `/${subdir.replace(/\\/g, "/")}/${outputName}`;
}
