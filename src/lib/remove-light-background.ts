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

/** 与边缘相连、偏亮且低饱和度的像素视为背景（典型白底商品图） */
function isBackgroundPixel(r: number, g: number, b: number, threshold: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max - min;
  return max >= threshold && saturation <= 28;
}

function floodRemoveBackground(data: Buffer, width: number, height: number, threshold: number) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue: number[] = [];

  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2], threshold)) return;
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
    const i = idx * 4;
    data[i + 3] = 0;

    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  // 去掉与透明区域相邻的残留白边
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
      if (isBackgroundPixel(r, g, b, threshold - 16)) {
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
  floodRemoveBackground(pixels, info.width, info.height, 238);

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export function shouldRemoveLightBackground(ext: string): boolean {
  return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
}
