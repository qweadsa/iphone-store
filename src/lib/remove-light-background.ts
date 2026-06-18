import sharp from "sharp";

type Rgba = { r: number; g: number; b: number; a: number };

function readPixel(data: Buffer, idx: number): Rgba {
  return {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };
}

function pixelMax(r: number, g: number, b: number): number {
  return Math.max(r, g, b);
}

function pixelSaturation(r: number, g: number, b: number): number {
  const max = pixelMax(r, g, b);
  const min = Math.min(r, g, b);
  return max - min;
}

/** 边缘可剥离的浅底背景（略宽松，遇到产品阴影会停住） */
function isPeelableBackground(r: number, g: number, b: number): boolean {
  const max = pixelMax(r, g, b);
  const sat = pixelSaturation(r, g, b);
  return max >= 232 && sat <= 16;
}

/** 与边缘相连的纯白背景（严格，避免吃进白色产品） */
function isFloodBackground(r: number, g: number, b: number): boolean {
  const max = pixelMax(r, g, b);
  const sat = pixelSaturation(r, g, b);
  return max >= 250 && sat <= 8;
}

/** 与透明区相邻的极浅残留白边 */
function isRimBackground(r: number, g: number, b: number): boolean {
  const max = pixelMax(r, g, b);
  const sat = pixelSaturation(r, g, b);
  return max >= 252 && sat <= 5;
}

function clearAlpha(data: Buffer, idx: number) {
  data[idx * 4 + 3] = 0;
}

/** 从四边向内剥离浅底，遇到产品边缘（亮度/饱和度变化）即停止 */
function peelBorders(data: Buffer, width: number, height: number) {
  const get = (idx: number) => readPixel(data, idx * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const { r, g, b } = get(idx);
      if (!isPeelableBackground(r, g, b)) break;
      clearAlpha(data, idx);
    }
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] === 0) break;
      const { r, g, b } = get(idx);
      if (!isPeelableBackground(r, g, b)) break;
      clearAlpha(data, idx);
    }
  }

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] === 0) continue;
      const { r, g, b } = get(idx);
      if (!isPeelableBackground(r, g, b)) break;
      clearAlpha(data, idx);
    }
    for (let y = height - 1; y >= 0; y--) {
      const idx = y * width + x;
      if (data[idx * 4 + 3] === 0) break;
      const { r, g, b } = get(idx);
      if (!isPeelableBackground(r, g, b)) break;
      clearAlpha(data, idx);
    }
  }
}

function floodRemoveBackground(data: Buffer, width: number, height: number) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue: number[] = [];

  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isFloodBackground(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx - x) / width;
    clearAlpha(data, idx);

    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }
}

/** 仅去掉贴边的极浅白边，不侵蚀产品主体 */
function cleanupRim(data: Buffer, width: number, height: number) {
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const i = idx * 4;
      if (data[i + 3] === 0) continue;

      const neighbors = [
        (y - 1) * width + x,
        (y + 1) * width + x,
        y * width + (x - 1),
        y * width + (x + 1),
      ];
      const touchesBg = neighbors.some((n) => data[n * 4 + 3] === 0);
      if (!touchesBg) continue;

      const { r, g, b } = readPixel(data, i);
      if (isRimBackground(r, g, b)) {
        data[i + 3] = 0;
      }
    }
  }
}

export async function removeLightBackgroundFromBuffer(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  peelBorders(pixels, info.width, info.height);
  floodRemoveBackground(pixels, info.width, info.height);
  cleanupRim(pixels, info.width, info.height);

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export function shouldRemoveLightBackground(ext: string): boolean {
  return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
}
