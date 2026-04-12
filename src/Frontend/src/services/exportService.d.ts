import type { Model } from '../../../models/Model';
/**
 * Export model as JSON file
 */
export declare function exportModelAsJSON(model: Model, fileName: string): void;
/**
 * Export model as PNG file at 1:1 pixel scale (true pixel art)
 */
export declare function exportModelAsPNG(model: Model, fileName: string): void;
/**
 * Export model as JPG file at 1:1 pixel scale
 * @param quality - JPG quality (0-1, default 0.9)
 */
export declare function exportModelAsJPG(model: Model, fileName: string, quality?: number): void;
/**
 * Export model as WebP file at 1:1 pixel scale
 * @param quality - WebP quality (0-1, default 0.9)
 */
export declare function exportModelAsWebP(model: Model, fileName: string, quality?: number): void;
//# sourceMappingURL=exportService.d.ts.map