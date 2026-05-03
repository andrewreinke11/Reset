import { connectDatabase, disconnectDatabase } from "../config/mongo";
import { UserModel } from "../models/schemas/UserSchema";
import { FileModel } from "../models/schemas/FileSchema";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "../../data");

/**
 * Migration utility to transfer data from JSON file system to MongoDB
 * Run with: npm run migrate
 */

async function migrateUsersAndFiles() {
  try {
    console.log("Starting migration from JSON to MongoDB...");
    await connectDatabase();

    // Load users from JSON
    const usersFile = path.join(DATA_DIR, "users.json");
    if (!fs.existsSync(usersFile)) {
      console.log("No users.json file found. Skipping user migration.");
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    console.log(`Found ${usersData.length} users to migrate`);

    for (const userData of usersData) {
      try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({
          username: userData.userName
        });
        if (existingUser) {
          console.log(`User "${userData.userName}" already exists in MongoDB. Skipping.`);
          continue;
        }

        // Create user in MongoDB
        const newUser = new UserModel({
          username: userData.userName,
          password: userData.passwordHash, // Already hashed in JSON
          files: userData.files || []
        });
        await newUser.save();
        console.log(`✓ Migrated user: ${userData.userName}`);

        // Migrate user's files
        const userDataDir = path.join(DATA_DIR, userData.userName);
        if (fs.existsSync(userDataDir)) {
          const files = fs.readdirSync(userDataDir).filter(f => f.endsWith(".json"));
          for (const fileName of files) {
            const fileNameWithoutExt = path.basename(fileName, ".json");
            const fileData = JSON.parse(
              fs.readFileSync(path.join(userDataDir, fileName), "utf-8")
            );

            // Check if file already exists
            const existingFile = await FileModel.findOne({
              username: userData.userName,
              filename: fileNameWithoutExt
            });
            if (existingFile) {
              console.log(`  File "${fileNameWithoutExt}" already exists. Skipping.`);
              continue;
            }

            // Convert palette format
            const palette = fileData.palette.map((p: any) => ({
              r: p.red,
              g: p.green,
              b: p.blue
            }));

            // Convert pixels format
            const pixels: Array<{ x: number; y: number; colorIndex: number }> =
              [];
            for (let y = 0; y < fileData.pixels.length; y++) {
              for (let x = 0; x < fileData.pixels[y].length; x++) {
                const pixel = fileData.pixels[y][x];
                if (pixel) {
                  // Find matching color index
                  let colorIndex = 0;
                  for (let i = 0; i < fileData.palette.length; i++) {
                    const c = fileData.palette[i];
                    if (
                      c.red === pixel.red &&
                      c.green === pixel.green &&
                      c.blue === pixel.blue
                    ) {
                      colorIndex = i;
                      break;
                    }
                  }
                  pixels.push({ x, y, colorIndex });
                }
              }
            }

            // Create file in MongoDB
            const newFile = new FileModel({
              username: userData.userName,
              filename: fileNameWithoutExt,
              width: fileData.width,
              height: fileData.height,
              palette,
              pixels,
              history: fileData.history || [],
              historyIndex: fileData.historyIndex || -1
            });
            await newFile.save();
            console.log(`  ✓ Migrated file: ${fileNameWithoutExt}`);
          }
        }
      } catch (error) {
        console.error(`Error migrating user "${userData.userName}":`, error);
      }
    }

    console.log("✓ Migration completed successfully!");
    await disconnectDatabase();
  } catch (error) {
    console.error("Migration failed:", error);
    await disconnectDatabase();
    process.exit(1);
  }
}

// Run migration
migrateUsersAndFiles();
