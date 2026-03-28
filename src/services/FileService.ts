import { ResetFile } from "../models/ResetFile";
import { storageService } from "./StorageService";
import type { Model } from "../models/Model";
import type { Pixel } from "../models/Pixel";
import type { PaletteColor } from "../models/PaletteColor";

export class FileService {
  private userFiles: Map<string, Map<string, ResetFile>> = new Map(); // userName -> (fileName -> ResetFile)

  constructor() {
    // Files are loaded on-demand when users access them
  }

  // Load all files for a specific user
  private loadUserFiles(userName: string): void {
    if (!this.userFiles.has(userName)) {
      this.userFiles.set(userName, new Map());
    }

    try {
      const savedFiles = storageService.loadAllUserFiles(userName);
      const userFileMap = this.userFiles.get(userName)!;

      for (const [fileName, model] of savedFiles) {
        if (!userFileMap.has(fileName)) {
          const file = new ResetFile(fileName, model);
          userFileMap.set(fileName, file);
        }
      }
    } catch (error) {
      console.error(`Failed to load files for user "${userName}":`, error);
    }
  }

  // Get a user's file
  getUserFile(userName: string, fileName: string): ResetFile | undefined {
    this.loadUserFiles(userName);
    const userFileMap = this.userFiles.get(userName);
    return userFileMap?.get(fileName);
  }

  // Helper: Create transparent white pixel
  private createTransparentWhite(): Pixel {
    return { red: 255, green: 255, blue: 255, alpha: 0 };
  }

  // Helper: Create transparent white palette color
  private createTransparentWhitePaletteColor(): PaletteColor {
    return { red: 255, green: 255, blue: 255, alpha: 0, pixels: [] };
  }

  // Helper: Validate color values
  private validateColor(red: number, green: number, blue: number, alpha: number): boolean {
    return red >= 0 && red <= 255 && green >= 0 && green <= 255 && blue >= 0 && blue <= 255 && alpha >= 0 && alpha <= 255;
  }

  // Helper: Save current model state to persistent storage
  private saveToStorage(userName: string, fileName: string): void {
    const file = this.getUserFile(userName, fileName);
    if (file) {
      const currentModel = file.current();
      if (currentModel) {
        storageService.saveModel(userName, fileName, currentModel);
      }
    }
  }

  // Create a new file for a user
  createFile(userName: string, fileName: string, width: number, height: number): ResetFile {
    if (!fileName || width <= 0 || height <= 0) {
      throw new Error("Invalid file name or dimensions");
    }

    this.loadUserFiles(userName);
    const userFileMap = this.userFiles.get(userName)!;

    if (userFileMap.has(fileName)) {
      throw new Error(`File "${fileName}" already exists for user "${userName}"`);
    }

    // Initialize palette with transparent white
    const paletteColor = this.createTransparentWhitePaletteColor();

    // Initialize pixels grid
    const pixels: Pixel[][] = [];
    for (let y = 0; y < height; y++) {
      const row: Pixel[] = [];
      for (let x = 0; x < width; x++) {
        const pixel = this.createTransparentWhite();
        row.push(pixel);
        paletteColor.pixels.push(pixel);
      }
      pixels.push(row);
    }

    const initialModel: Model = {
      width,
      height,
      pixels,
      palette: [paletteColor],
    };

    const file = new ResetFile(fileName, initialModel);
    userFileMap.set(fileName, file);
    storageService.saveModel(userName, fileName, initialModel);
    return file;
  }

  // Add a color to the palette
  addColorToPalette(userName: string, fileName: string, red: number, green: number, blue: number, alpha: number): void {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (!this.validateColor(red, green, blue, alpha)) {
      throw new Error("Color values must be between 0 and 255");
    }

    const currentModel = file.current();
    if (!currentModel) {
      throw new Error("File has no current model");
    }

    const newColor: PaletteColor = { red, green, blue, alpha, pixels: [] };
    const updatedModel: Model = {
      ...currentModel,
      palette: [...currentModel.palette, newColor],
    };

    file.push(updatedModel);
    this.saveToStorage(userName, fileName);
  }

  // Update a palette color and cascade to all pixels using it
  updatePaletteColor(userName: string, fileName: string, colorIndex: number, red: number, green: number, blue: number, alpha: number): void {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (!this.validateColor(red, green, blue, alpha)) {
      throw new Error("Color values must be between 0 and 255");
    }

    const currentModel = file.current();
    if (!currentModel) {
      throw new Error("File has no current model");
    }

    if (colorIndex < 0 || colorIndex >= currentModel.palette.length) {
      throw new Error(`Color index ${colorIndex} out of range`);
    }

    // Create new palette with updated color
    const newPalette = currentModel.palette.map((color, index) =>
      index === colorIndex ? { ...color, red, green, blue, alpha } : color
    );

    // Update pixels that reference this color
    const newPixels = currentModel.pixels.map(row =>
      row.map(pixel => {
        if (
          pixel.red === currentModel.palette[colorIndex]!.red &&
          pixel.green === currentModel.palette[colorIndex]!.green &&
          pixel.blue === currentModel.palette[colorIndex]!.blue &&
          pixel.alpha === currentModel.palette[colorIndex]!.alpha
        ) {
          return { red, green, blue, alpha };
        }
        return pixel;
      })
    );

    const updatedModel: Model = {
      ...currentModel,
      pixels: newPixels,
      palette: newPalette,
    };

    file.push(updatedModel);
    this.saveToStorage(userName, fileName);
  }

  // Recolor a pixel (change it to use a different palette color)
  recolorPixel(userName: string, fileName: string, x: number, y: number, colorIndex: number): void {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    const currentModel = file.current();
    if (!currentModel) {
      throw new Error("File has no current model");
    }

    if (x < 0 || x >= currentModel.width || y < 0 || y >= currentModel.height) {
      throw new Error(`Pixel coordinates (${x}, ${y}) out of bounds`);
    }

    if (colorIndex < 0 || colorIndex >= currentModel.palette.length) {
      throw new Error(`Color index ${colorIndex} out of range`);
    }

    // Create new pixels with the updated color at the specified position
    const newPixels = currentModel.pixels.map((row, rowIndex) =>
      row.map((pixel, colIndex) => {
        if (rowIndex === y && colIndex === x) {
          const targetColor = currentModel.palette[colorIndex]!;
          return { red: targetColor.red, green: targetColor.green, blue: targetColor.blue, alpha: targetColor.alpha };
        }
        return pixel;
      })
    );

    const updatedModel: Model = {
      ...currentModel,
      pixels: newPixels,
    };

    file.push(updatedModel);
    this.saveToStorage(userName, fileName);
  }

  // Undo
  undo(userName: string, fileName: string): Model | undefined {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    const result = file.undo();
    if (result) {
      this.saveToStorage(userName, fileName);
    }
    return result;
  }

  // Redo
  redo(userName: string, fileName: string): Model | undefined {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    const result = file.redo();
    if (result) {
      this.saveToStorage(userName, fileName);
    }
    return result;
  }

  // Check if undo is available
  canUndo(userName: string, fileName: string): boolean {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    return file.canUndo();
  }

  // Check if redo is available
  canRedo(userName: string, fileName: string): boolean {
    const file = this.getUserFile(userName, fileName);
    if (!file) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    return file.canRedo();
  }

  // Delete a file
  deleteFile(userName: string, fileName: string): void {
    this.loadUserFiles(userName);
    const userFileMap = this.userFiles.get(userName);
    if (!userFileMap?.has(fileName)) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    userFileMap.delete(fileName);
    storageService.deleteUserFile(userName, fileName);
  }

  // List all saved files for a user
  listUserFiles(userName: string): string[] {
    return storageService.listUserFiles(userName);
  }
}

// Export a singleton instance
export const fileService = new FileService();
