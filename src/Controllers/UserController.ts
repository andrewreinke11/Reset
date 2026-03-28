import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, users, loadUsers, saveUsers } from "../models/User";
import type { ResetFile } from "../models/ResetFile";

const router = express.Router();

loadUsers();

function findUser(userName: string): User | undefined {
  return users.find((u) => u.userName.toLowerCase() === userName.toLowerCase());
}

router.get("/", (req: Request, res: Response) => {
  const usersResponse = users.map(({ passwordHash, ...u }) => u);
  res.json(usersResponse);
});

router.get("/:userName", (req: Request, res: Response) => {
  const user = findUser(req.params.userName as string);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { passwordHash, ...userResponse } = user;
  res.json(userResponse);
});

router.post("/", async (req: Request, res: Response) => {
  const { userName, email, password } = req.body as { userName?: string; email?: string; password?: string };
  if (!userName || !email || !password) {
    return res.status(400).json({ message: "userName, email, and password are required" });
  }

  if (findUser(userName)) {
    return res.status(409).json({ message: "User already exists" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      userName,
      email,
      passwordHash,
      files: [],
    };

    users.push(newUser);
    saveUsers();
    const { passwordHash: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { userName, password } = req.body as { userName?: string; password?: string };
  if (!userName || !password) {
    return res.status(400).json({ message: "userName and password are required" });
  }

  const user = findUser(userName);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  try {
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error during login" });
  }
});

router.put("/:userName", async (req: Request, res: Response) => {
  const user = findUser(req.params.userName as string);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { email, password, files } = req.body as { email?: string; password?: string; files?: string[] };
  if (email !== undefined) user.email = email;
  if (password !== undefined) {
    try {
      user.passwordHash = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ message: "Error updating password" });
    }
  }
  if (files !== undefined) user.files = Array.isArray(files) ? files : user.files;

  saveUsers();

  const { passwordHash, ...userResponse } = user;
  res.json(userResponse);
});

router.delete("/:userName", (req: Request, res: Response) => {
  const index = users.findIndex((u) => u.userName.toLowerCase() === (req.params.userName as string).toLowerCase());
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  const [deleted] = users.splice(index, 1);
  saveUsers();
  res.json(deleted);
});

export default router;
