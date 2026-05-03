import { FileModel, IFile } from "../models/schemas/FileSchema";
import { UserModel } from "../models/schemas/UserSchema";
import type { Model } from "../models/Model";
import type { Pixel } from "../models/Pixel";
import type { PaletteColor } from "../models/PaletteColor";
import { ResetFile } from "../models/ResetFile";

interface FileData {
  width: number;
  height: number;
  pixels: Array<{ x: number; y: number; colorIndex: number }>;
  palette: Array<{ r: number; g: number; b: number }>;
  history: Array<{
    pixels: Array<{ x: number; y: number; colorIndex: number }>;
    palette: Array<{ r: number; g: number; b: number }>;
  }>;
  historyIndex: number;
}

export class MongoFileService {
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

  // Helper: Convert Mongoose IFile to ResetFile for use in memory
  private async convertToResetFile(dbFile: IFile): Promise<ResetFile> {
    // Reconstruct Model from database format
    const model = this.reconstructModel(dbFile);
    return new ResetFile(dbFile.filename, model);
  }

  // Helper: Reconstruct Model from database format
  private reconstructModel(dbFile: IFile): Model {
    // Convert flat pixel array to 2D array
    const pixels: Pixel[][] = [];
    for (let i = 0; i < dbFile.height; i++) {
      pixels.push([]);
    }
    
    for (const p of dbFile.pixels) {
      if (p.y >= 0 && p.y < dbFile.height && p.x >= 0 && p.x < dbFile.width) {
        pixels[p.y]![p.x] = {
          red: dbFile.palette[p.colorIndex]?.r ?? 0,
          green: dbFile.palette[p.colorIndex]?.g ?? 0,
          blue: dbFile.palette[p.colorIndex]?.b ?? 0,
          alpha: 255
        };
      }
    }

    // Convert palette format
    const palette: PaletteColor[] = dbFile.palette.map(p => ({
      red: p.r,
      green: p.g,
      blue: p.b,
      alpha: 255,
      pixels: []
    }));

    return {
      width: dbFile.width,
      height: dbFile.height,
      pixels,
      palette
    };
  }

  // Helper: Convert Model to database format
  private convertModelForDB(model: Model): {
    pixels: Array<{ x: number; y: number; colorIndex: number }>;
    palette: Array<{ r: number; g: number; b: number }>;
  } {
    const pixels: Array<{ x: number; y: number; colorIndex: number }> = [];
    const palette: Array<{ r: number; g: number; b: number }> = [];

    // Convert palette
    for (const color of model.palette) {
      palette.push({ r: color.red, g: color.green, b: color.blue });
    }

    // Convert pixels
    for (let y = 0; y < model.pixels.length; y++) {
      const row = model.pixels[y];
      if (!row) continue;
      for (let x = 0; x < row.length; x++) {
        const pixel = row[x];
        if (pixel) {
          // Find matching color index
          let colorIndex = 0;
          for (let i = 0; i < model.palette.length; i++) {
            const c = model.palette[i];
            if (c && c.red === pixel.red && c.green === pixel.green && c.blue === pixel.blue) {
              colorIndex = i;
              break;
            }
          }
          pixels.push({ x, y, colorIndex });
        }
      }
    }

    return { pixels, palette };
  }

  // Get a user's file
  async getUserFile(userName: string, fileName: string): Promise<ResetFile | undefined> {
    try {
      const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
      if (!dbFile) return undefined;
      return this.convertToResetFile(dbFile);
    } catch (error) {
      console.error(`Failed to load file "${fileName}" for user "${userName}":`, error);
      throw error;
    }
  }

  // Create a new file for a user
  async createFile(userName: string, fileName: string, width: number, height: number): Promise<ResetFile> {
    if (!fileName || width <= 0 || height <= 0) {
      throw new Error("Invalid file name or dimensions");
    }

    // Check if file already exists
    const existing = await FileModel.findOne({ username: userName, filename: fileName });
    if (existing) {
      throw new Error(`File "${fileName}" already exists for user "${userName}"`);
    }

    // Initialize palette with transparent white
    const palette = [{ r: 255, g: 255, b: 255 }];

    // Initialize empty pixels array (pixels will be added as drawn)
    const pixels: Array<{ x: number; y: number; colorIndex: number }> = [];

    // Create file in database
    const newFile = new FileModel({
      username: userName,
      filename: fileName,
      width,
      height,
      palette,
      pixels,
      history: [],
      historyIndex: -1
    });

    await newFile.save();

    // Add to user's files array
    await UserModel.findOneAndUpdate(
      { username: userName },
      { $addToSet: { files: fileName } }
    );

    // Convert and return as ResetFile
    return this.convertToResetFile(newFile);
  }

  // Add a color to the palette
  async addColorToPalette(
    userName: string,
    fileName: string,
    red: number,
    green: number,
    blue: number,
    alpha: number
  ): Promise<void> {
    if (!this.validateColor(red, green, blue, alpha)) {
      throw new Error("Color values must be between 0 and 255");
    }

    const result = await FileModel.findOneAndUpdate(
      { username: userName, filename: fileName },
      { $push: { palette: { r: red, g: green, b: blue } } },
      { new: true }
    );

    if (!result) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
  }

  // Update a palette color
  async updatePaletteColor(
    userName: string,
    fileName: string,
    colorIndex: number,
    red: number,
    green: number,
    blue: number,
    alpha: number
  ): Promise<void> {
    if (!this.validateColor(red, green, blue, alpha)) {
      throw new Error("Color values must be between 0 and 255");
    }

    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (colorIndex < 0 || colorIndex >= dbFile.palette.length) {
      throw new Error(`Color index ${colorIndex} out of range`);
    }

    // Update palette
    dbFile.palette[colorIndex] = { r: red, g: green, b: blue };
    await dbFile.save();
  }

  // Recolor a pixel
  async recolorPixel(
    userName: string,
    fileName: string,
    x: number,
    y: number,
    colorIndex: number
  ): Promise<void> {
    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (x < 0 || x >= dbFile.width || y < 0 || y >= dbFile.height) {
      throw new Error(`Pixel coordinates (${x}, ${y}) out of bounds`);
    }

    if (colorIndex < 0 || colorIndex >= dbFile.palette.length) {
      throw new Error(`Color index ${colorIndex} out of range`);
    }

    // Find or create pixel at this location
    const pixelIndex = dbFile.pixels.findIndex(p => p.x === x && p.y === y);
    if (pixelIndex >= 0) {
      const pixel = dbFile.pixels[pixelIndex];
      if (pixel) {
        pixel.colorIndex = colorIndex;
      }
    } else {
      dbFile.pixels.push({ x, y, colorIndex });
    }

    await dbFile.save();
  }

  // Undo
  async undo(userName: string, fileName: string): Promise<Model | undefined> {
    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (dbFile.historyIndex <= 0) {
      // Nothing to undo, return current state
      return this.reconstructModel(dbFile);
    }

    dbFile.historyIndex--;
    const historyState = dbFile.history[dbFile.historyIndex];
    if (historyState) {
      dbFile.palette = historyState.palette;
      dbFile.pixels = historyState.pixels;
    }
    await dbFile.save();

    return this.reconstructModel(dbFile);
  }

  // Redo
  async redo(userName: string, fileName: string): Promise<Model | undefined> {
    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    if (dbFile.historyIndex >= dbFile.history.length - 1) {
      // Nothing to redo, return current state
      return this.reconstructModel(dbFile);
    }

    dbFile.historyIndex++;
    const historyState = dbFile.history[dbFile.historyIndex];
    if (historyState) {
      dbFile.palette = historyState.palette;
      dbFile.pixels = historyState.pixels;
    }
    await dbFile.save();

    return this.reconstructModel(dbFile);
  }

  // Check if undo is available
  async canUndo(userName: string, fileName: string): Promise<boolean> {
    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    return dbFile.historyIndex > 0;
  }

  // Check if redo is available
  async canRedo(userName: string, fileName: string): Promise<boolean> {
    const dbFile = await FileModel.findOne({ username: userName, filename: fileName });
    if (!dbFile) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }
    return dbFile.historyIndex < dbFile.history.length - 1;
  }

  // Delete a file
  async deleteFile(userName: string, fileName: string): Promise<void> {
    const result = await FileModel.findOneAndDelete({ username: userName, filename: fileName });
    if (!result) {
      throw new Error(`File "${fileName}" not found for user "${userName}"`);
    }

    // Remove from user's files array
    await UserModel.findOneAndUpdate(
      { username: userName },
      { $pull: { files: fileName } }
    );
  }

  // List all files for a user
  async listUserFiles(userName: string): Promise<string[]> {
    const user = await UserModel.findOne({ username: userName });
    return user?.files || [];
  }
}

export const mongoFileService = new MongoFileService();
