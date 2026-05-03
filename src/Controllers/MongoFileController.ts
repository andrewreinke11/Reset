import express, { Request, Response } from "express";
import { mongoFileService } from "../services/MongoFileService";

const router = express.Router();

// Middleware to extract userName from request
const getUserName = (req: Request): string => {
  const userName =
    (req.headers["x-user-name"] as string) || req.body.userName;
  if (!userName) {
    throw new Error("User authentication required");
  }
  return userName;
};

// Create a new file
router.post("/create", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const { fileName, width, height } = req.body as {
      fileName?: string;
      width?: number;
      height?: number;
    };

    if (!fileName || !width || !height) {
      return res.status(400).json({
        message: "fileName, width, and height are required"
      });
    }

    const file = await mongoFileService.createFile(
      userName,
      fileName,
      width,
      height
    );
    res.status(201).json({ fileName, model: file.current() });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Add a color to the palette
router.post("/:fileName/palette/add", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";
    const { red, green, blue, alpha } = req.body as {
      red?: number;
      green?: number;
      blue?: number;
      alpha?: number;
    };

    if (
      red === undefined ||
      green === undefined ||
      blue === undefined ||
      alpha === undefined
    ) {
      return res.status(400).json({
        message: "red, green, blue, and alpha are required"
      });
    }

    await mongoFileService.addColorToPalette(
      userName,
      fileName,
      red,
      green,
      blue,
      alpha
    );
    const file = await mongoFileService.getUserFile(userName, fileName);
    res.json({
      model: file?.current(),
      canUndo: await mongoFileService.canUndo(userName, fileName),
      canRedo: await mongoFileService.canRedo(userName, fileName)
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update a palette color (cascade to pixels)
router.put(
  "/:fileName/palette/:colorIndex",
  async (req: Request, res: Response) => {
    try {
      const userName = getUserName(req);
      const fileName = (req.params.fileName as string) ?? "";
      const colorIndex = (req.params.colorIndex as string) ?? "";
      const { red, green, blue, alpha } = req.body as {
        red?: number;
        green?: number;
        blue?: number;
        alpha?: number;
      };

      if (
        red === undefined ||
        green === undefined ||
        blue === undefined ||
        alpha === undefined
      ) {
        return res.status(400).json({
          message: "red, green, blue, and alpha are required"
        });
      }

      const index = parseInt(colorIndex, 10);
      await mongoFileService.updatePaletteColor(
        userName,
        fileName,
        index,
        red,
        green,
        blue,
        alpha
      );
      const file = await mongoFileService.getUserFile(userName, fileName);
      res.json({
        model: file?.current(),
        canUndo: await mongoFileService.canUndo(userName, fileName),
        canRedo: await mongoFileService.canRedo(userName, fileName)
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }
);

// Recolor a pixel
router.put("/:fileName/pixel", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";
    const { x, y, colorIndex } = req.body as {
      x?: number;
      y?: number;
      colorIndex?: number;
    };

    if (x === undefined || y === undefined || colorIndex === undefined) {
      return res.status(400).json({
        message: "x, y, and colorIndex are required"
      });
    }

    await mongoFileService.recolorPixel(
      userName,
      fileName,
      x,
      y,
      colorIndex
    );
    const file = await mongoFileService.getUserFile(userName, fileName);
    res.json({
      model: file?.current(),
      canUndo: await mongoFileService.canUndo(userName, fileName),
      canRedo: await mongoFileService.canRedo(userName, fileName)
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Undo
router.post("/:fileName/undo", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";

    const model = await mongoFileService.undo(userName, fileName);
    res.json({
      model,
      canUndo: await mongoFileService.canUndo(userName, fileName),
      canRedo: await mongoFileService.canRedo(userName, fileName)
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Redo
router.post("/:fileName/redo", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";

    const model = await mongoFileService.redo(userName, fileName);
    res.json({
      model,
      canUndo: await mongoFileService.canUndo(userName, fileName),
      canRedo: await mongoFileService.canRedo(userName, fileName)
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get file state
router.get("/:fileName", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";

    const file = await mongoFileService.getUserFile(userName, fileName);
    if (!file) {
      return res.status(404).json({
        message: `File "${fileName}" not found for user "${userName}"`
      });
    }
    res.json({
      model: file.current(),
      canUndo: await mongoFileService.canUndo(userName, fileName),
      canRedo: await mongoFileService.canRedo(userName, fileName)
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete a file
router.delete("/:fileName", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const fileName = (req.params.fileName as string) ?? "";

    await mongoFileService.deleteFile(userName, fileName);
    res.json({
      message: `File "${fileName}" deleted for user "${userName}"`
    });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// List all files for user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userName = getUserName(req);
    const files = await mongoFileService.listUserFiles(userName);
    res.json({ files });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
