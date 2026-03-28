import fs from "fs";
import path from "path";
import type { ResetFile } from "./ResetFile";

export interface User {
  userName: string;
  email: string;
  files: string[];
  passwordHash: string;
}

const userDataPath = path.join(process.cwd(), "data", "users.json");

export let users: User[] = [];

export function loadUsers(): void {
  try {
    if (!fs.existsSync(path.dirname(userDataPath))) {
      fs.mkdirSync(path.dirname(userDataPath), { recursive: true });
    }

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
