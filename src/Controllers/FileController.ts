import express, { Request, Response } from "express";
import { fileService } from "../services/FileService";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

router.use(authenticateToken);

const getUserName = (req: Request): string => {
  const userName = (req as AuthenticatedRequest).userName;
  if (!userName) {
    throw new Error("User authentication required");
  }
  return userName;
};

router.post("/create", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName, width, height } = req.body as { fileName?: string; width?: number; height?: number };

    if (!fileName || !width || !height) {
      return res.status(400).json({ message: "fileName, width, and height are required" });
    }

    const file = fileService.createFile(userName, fileName, width, height);
    res.status(201).json({ fileName, model: file.current() });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post("/:fileName/palette/add", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;
    const { red, green, blue, alpha } = req.body as { red?: number; green?: number; blue?: number; alpha?: number };

    if (red === undefined || green === undefined || blue === undefined || alpha === undefined) {
      return res.status(400).json({ message: "red, green, blue, and alpha are required" });
    }

    fileService.addColorToPalette(userName, fileName as string, red, green, blue, alpha);
    const file = fileService.getUserFile(userName, fileName as string);
    res.json({ model: file?.current(), canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.put("/:fileName/palette/:colorIndex", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName, colorIndex } = req.params;
    const { red, green, blue, alpha } = req.body as { red?: number; green?: number; blue?: number; alpha?: number };

    if (red === undefined || green === undefined || blue === undefined || alpha === undefined) {
      return res.status(400).json({ message: "red, green, blue, and alpha are required" });
    }

    const index = parseInt(colorIndex as string, 10);
    fileService.updatePaletteColor(userName, fileName as string, index, red, green, blue, alpha);
    const file = fileService.getUserFile(userName, fileName as string);
    res.json({ model: file?.current(), canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.put("/:fileName/pixel", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;
    const { x, y, colorIndex } = req.body as { x?: number; y?: number; colorIndex?: number };

    if (x === undefined || y === undefined || colorIndex === undefined) {
      return res.status(400).json({ message: "x, y, and colorIndex are required" });
    }

    fileService.recolorPixel(userName, fileName as string, x, y, colorIndex);
    const file = fileService.getUserFile(userName, fileName as string);
    res.json({ model: file?.current(), canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post("/:fileName/undo", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;

    const model = fileService.undo(userName, fileName as string);
    res.json({ model, canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.post("/:fileName/redo", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;

    const model = fileService.redo(userName, fileName as string);
    res.json({ model, canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.get("/:fileName", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;

    const file = fileService.getUserFile(userName, fileName as string);
    if (!file) {
      return res.status(404).json({ message: `File "${fileName}" not found for user "${userName}"` });
    }
    res.json({ model: file.current(), canUndo: fileService.canUndo(userName, fileName as string), canRedo: fileService.canRedo(userName, fileName as string) });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete("/:fileName", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName } = req.params;

    fileService.deleteFile(userName, fileName as string);
    res.json({ message: `File "${fileName}" deleted for user "${userName}"` });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.get("/", (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const files = fileService.listUserFiles(userName);
    res.json({ files });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
