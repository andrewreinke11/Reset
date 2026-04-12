import fs from "fs";
import path from "path";
import type { ResetFile } from "./ResetFile";

export interface User {
  userName: string;
  email: string;
  files: string[];
  passwordHash: string;
}
// Path to the users.json file for persistent storage
const userDataPath = path.join(process.cwd(), "data", "users.json");

export let users: User[] = [];

export function loadUsers(): void {
  
  try {
    // Ensure the data directory exists
    if (!fs.existsSync(path.dirname(userDataPath))) {
      fs.mkdirSync(path.dirname(userDataPath), { recursive: true });
    }
    // Load users from disk if the file exists, otherwise initialize an empty array
    if (fs.existsSync(userDataPath)) {
      const fileContents = fs.readFileSync(userDataPath, "utf8");
      users = JSON.parse(fileContents) as User[];
    } else {
      users = [];
      fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2), "utf8");
    }
  } catch (error) {
    console.error("Failed to load users from disk", error);
    users = [];
  }
}

export function saveUsers(): void {
  try {
    fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save users to disk", error);
  }
}
