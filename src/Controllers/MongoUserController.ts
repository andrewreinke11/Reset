import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/schemas/UserSchema";

const router = express.Router();

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get a specific user
router.get("/:userName", async (req: Request, res: Response) => {
  try {
    const userName = (req.params.userName as string) ?? "";
    const user = await UserModel.findOne({ username: userName }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userResponse = user.toObject();
    userResponse.files = Array.isArray(userResponse.files) ? userResponse.files : [];
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Create a new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      username,
      password: hashedPassword,
      files: []
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete (userResponse as any).password;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// User login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password are required" });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    res.json(userResponse);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Update user
router.put("/:userName", async (req: Request, res: Response) => {
  try {
    const userName = (req.params.userName as string) ?? "";
    const user = await UserModel.findOne({ username: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email, password, files } = req.body as {
      email?: string;
      password?: string;
      files?: string[];
    };

    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (files && Array.isArray(files)) {
      user.files = files;
    }

    await user.save();
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete user
router.delete("/:userName", async (req: Request, res: Response) => {
  try {
    const userName = (req.params.userName as string) ?? "";
    const user = await UserModel.findOneAndDelete({
      username: userName
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: `User "${userName}" deleted successfully` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

export default router;
