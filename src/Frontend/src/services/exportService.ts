import type { Model } from '../../../models/Model';

/**
 * Export model as JSON file
 */
export function exportModelAsJSON(model: Model, fileName: string): void {
  const jsonData = JSON.stringify(model, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  downloadBlob(blob, `${fileName}.json`);
}

/**
 * Export model as PNG file at 1:1 pixel scale (true pixel art)
 */
export function exportModelAsPNG(model: Model, fileName: string): void {
  const canvas = document.createElement('canvas');
  canvas.width = model.width;    // 1:1 scale - each pixel = 1px
  canvas.height = model.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw each pixel at 1:1 scale
  for (let y = 0; y < model.height; y++) {
    for (let x = 0; x < model.width; x++) {
      const pixel = model.pixels[y][x];
      const color = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha / 255})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Convert canvas to PNG blob
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create PNG from canvas');
    }
    downloadBlob(blob, `${fileName}.png`);
  }, 'image/png');
}

/**
 * Export model as JPG file at 1:1 pixel scale
 * @param quality - JPG quality (0-1, default 0.9)
 */
export function exportModelAsJPG(model: Model, fileName: string, quality: number = 0.9): void {
  const canvas = document.createElement('canvas');
  canvas.width = model.width;
  canvas.height = model.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw each pixel at 1:1 scale
  for (let y = 0; y < model.height; y++) {
    for (let x = 0; x < model.width; x++) {
      const pixel = model.pixels[y][x];
      const color = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha / 255})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Convert canvas to JPG blob
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create JPG from canvas');
    }
    downloadBlob(blob, `${fileName}.jpg`);
  }, 'image/jpeg', quality);
}

/**
 * Export model as WebP file at 1:1 pixel scale
 * @param quality - WebP quality (0-1, default 0.9)
 */
export function exportModelAsWebP(model: Model, fileName: string, quality: number = 0.9): void {
  const canvas = document.createElement('canvas');
  canvas.width = model.width;
  canvas.height = model.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw each pixel at 1:1 scale
  for (let y = 0; y < model.height; y++) {
    for (let x = 0; x < model.width; x++) {
      const pixel = model.pixels[y][x];
      const color = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha / 255})`;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Convert canvas to WebP blob
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create WebP from canvas');
    }
    downloadBlob(blob, `${fileName}.webp`);
  }, 'image/webp', quality);
}

/**
 * Helper function to trigger file download from blob
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
