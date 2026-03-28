import fs from "fs";
import path from "path";
import type { Model } from "../models/Model";

export class StorageService {
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), "data");
    this.ensureDirectoryExists(this.storageDir);
  }

  // Ensure a directory exists
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  // Get the file path for a user's file
  private getUserFilePath(userName: string, fileName: string): string {
    const userDir = path.join(this.storageDir, userName);
    this.ensureDirectoryExists(userDir);
    return path.join(userDir, `${fileName}.json`);
  }

  // Save a model to disk as JSON for a specific user
  saveModel(userName: string, fileName: string, model: Model): void {
    try {
      const filePath = this.getUserFilePath(userName, fileName);
      const data = JSON.stringify(model, null, 2);
      fs.writeFileSync(filePath, data, "utf-8");
    } catch (error) {
      throw new Error(`Failed to save file "${fileName}" for user "${userName}": ${(error as Error).message}`);
    }
  }

  // Load a model from disk for a specific user
  loadModel(userName: string, fileName: string): Model | null {
    try {
      const filePath = this.getUserFilePath(userName, fileName);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as Model;
    } catch (error) {
      throw new Error(`Failed to load file "${fileName}" for user "${userName}": ${(error as Error).message}`);
    }
  }

  // Load all files for a specific user
  loadAllUserFiles(userName: string): Map<string, Model> {
    const files = new Map<string, Model>();
    try {
      const userDir = path.join(this.storageDir, userName);
      if (!fs.existsSync(userDir)) {
        return files;
      }

      const fileNames = fs.readdirSync(userDir);
      for (const fileName of fileNames) {
        if (fileName.endsWith(".json")) {
          const name = fileName.slice(0, -5); // Remove .json extension
          const model = this.loadModel(userName, name);
          if (model) {
            files.set(name, model);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load files for user "${userName}": ${(error as Error).message}`);
    }
    return files;
  }

  // Delete a user's file from disk
  deleteUserFile(userName: string, fileName: string): void {
    try {
      const filePath = this.getUserFilePath(userName, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to delete file "${fileName}" for user "${userName}": ${(error as Error).message}`);
    }
  }

  // Check if a user's file exists
  userFileExists(userName: string, fileName: string): boolean {
    const filePath = this.getUserFilePath(userName, fileName);
    return fs.existsSync(filePath);
  }

  // List all files for a specific user
  listUserFiles(userName: string): string[] {
    try {
      const userDir = path.join(this.storageDir, userName);
      if (!fs.existsSync(userDir)) {
        return [];
      }
      const fileNames = fs.readdirSync(userDir);
      return fileNames
        .filter((name) => name.endsWith(".json"))
        .map((name) => name.slice(0, -5)); // Remove .json extension
    } catch (error) {
      console.error(`Failed to list files for user "${userName}": ${(error as Error).message}`);
      return [];
    }
  }

  // Delete all files for a user (when user is deleted)
  deleteAllUserFiles(userName: string): void {
    try {
      const userDir = path.join(this.storageDir, userName);
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }
    } catch (error) {
      throw new Error(`Failed to delete all files for user "${userName}": ${(error as Error).message}`);
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
