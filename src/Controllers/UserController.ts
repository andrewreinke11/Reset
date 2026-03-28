import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, users } from "../models/User";
import type { ResetFile } from "../models/ResetFile";

const router = express.Router();

function findUser(userName: string): User | undefined {
  return users.find((u) => u.userName.toLowerCase() === userName.toLowerCase());
}

router.get("/", (req: Request, res: Response) => {
  res.json(users);
});

router.get("/:userName", (req: Request, res: Response) => {
  const user = findUser(req.params.userName as string);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
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
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

router.put("/:userName", async (req: Request, res: Response) => {
  const user = findUser(req.params.userName as string);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { email, password, files } = req.body as { email?: string; password?: string; files?: ResetFile[] };
  if (email !== undefined) user.email = email;
  if (password !== undefined) {
    try {
      user.passwordHash = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({ message: "Error updating password" });
    }
  }
  if (files !== undefined) user.files = Array.isArray(files) ? files : user.files;

  res.json(user);
});

router.delete("/:userName", (req: Request, res: Response) => {
  const index = users.findIndex((u) => u.userName.toLowerCase() === (req.params.userName as string).toLowerCase());
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  const [deleted] = users.splice(index, 1);
  res.json(deleted);
});

export default router;
