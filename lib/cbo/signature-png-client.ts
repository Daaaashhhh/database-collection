/** Near-white pixels become fully transparent so signatures overlay cleanly in Excel. */
const WHITE_THRESHOLD = 245;

/**
 * Converts a signature PNG to transparent background.
 * Cropping is optional and should be used for Excel export only — cropping
 * on the pad makes the saved image stretch when redrawn on the full canvas.
 */
export function signatureToTransparentPng(
  dataUrl: string,
  options?: { crop?: boolean },
): Promise<string> {
  if (!dataUrl || typeof document === "undefined") {
    return Promise.resolve(dataUrl);
  }

  const crop = options?.crop ?? false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (
          r >= WHITE_THRESHOLD &&
          g >= WHITE_THRESHOLD &&
          b >= WHITE_THRESHOLD
        ) {
          pixels[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const output = crop ? cropCanvasToInkBounds(canvas) : canvas;
      resolve(output.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function cropCanvasToInkBounds(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return canvas;

  const pad = 6;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;
  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  const cropCtx = cropped.getContext("2d");
  if (!cropCtx) return canvas;

  cropCtx.drawImage(
    canvas,
    minX,
    minY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );
  return cropped;
}
