import { FileService } from '../src/services/FileService';
import fs from 'fs';
import path from 'path';

const TEST_DIR = path.join(__dirname, '../data/mc-dc-fileservice-tests');

const ensureTestDir = () => {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
};

const cleanupTestDir = () => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
};

describe('MC/DC Coverage - Function 4-10: FileService Operations', () => {
  let fileService: FileService;
  let testUserName: string;
  let counter = 0;

  beforeEach(() => {
    fileService = new FileService();
    testUserName = `mc-dc-test-${Date.now()}-${counter++}`;
    ensureTestDir();
  });

  afterEach(cleanupTestDir);

  describe('Function 5: createFile() - File Creation', () => {
    it('TC1: Should successfully create a file with valid dimensions (32x32)', () => {
      const file = fileService.createFile(testUserName, 'test-valid.pixel', 32, 32);
      expect(file).toBeDefined();
      expect(file.name).toBe('test-valid.pixel');
    });

    it('TC2: Should fail when creating file with zero width', () => {
      expect(() => {
        fileService.createFile(testUserName, 'test-zero-width.pixel', 0, 32);
      }).toThrow();
    });

    it('TC3: Should fail when creating file with zero height', () => {
      expect(() => {
        fileService.createFile(testUserName, 'test-zero-height.pixel', 32, 0);
      }).toThrow();
    });

    it('TC4: Should fail when creating file with empty filename', () => {
      expect(() => {
        fileService.createFile(testUserName, '', 32, 32);
      }).toThrow();
    });

    it('TC5: Should fail when creating duplicate file', () => {
      fileService.createFile(testUserName, 'duplicate.pixel', 32, 32);
      expect(() => {
        fileService.createFile(testUserName, 'duplicate.pixel', 32, 32);
      }).toThrow('already exists');
    });
  });

  describe('Function 9: recolorPixel() - Pixel Recoloring', () => {
    beforeEach(() => {
      fileService.createFile(testUserName, 'recolor-test.pixel', 16, 16);
      // Add a color to the palette
      fileService.addColorToPalette(testUserName, 'recolor-test.pixel', 255, 0, 0, 255);
    });

    it('TC1: Should successfully recolor pixel with valid coordinates and color index', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 0, 0, 0);
      }).not.toThrow();
    });

    it('TC2: Should fail when recoloring with negative X coordinate', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', -1, 0, 0);
      }).toThrow('out of bounds');
    });

    it('TC3: Should fail when recoloring with X coordinate out of bounds', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 16, 0, 0);
      }).toThrow('out of bounds');
    });

    it('TC4: Should fail when recoloring with negative Y coordinate', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 0, -1, 0);
      }).toThrow('out of bounds');
    });

    it('TC5: Should fail when recoloring with Y coordinate out of bounds', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 0, 16, 0);
      }).toThrow('out of bounds');
    });

    it('TC6: Should fail when recoloring with invalid color index', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 0, 0, 10);
      }).toThrow('out of range');
    });

    it('TC7: Should work on boundary pixels (bottom-right)', () => {
      expect(() => {
        fileService.recolorPixel(testUserName, 'recolor-test.pixel', 15, 15, 0);
      }).not.toThrow();
    });
  });

  describe('Function 10: updatePaletteColor() - Palette Updates', () => {
    beforeEach(() => {
      fileService.createFile(testUserName, 'palette-test.pixel', 16, 16);
      fileService.addColorToPalette(testUserName, 'palette-test.pixel', 255, 0, 0, 255);
    });

    it('TC1: Should successfully update palette color with valid RGBA values', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 100, 150, 200, 255);
      }).not.toThrow();
    });

    it('TC2: Should fail when updating with color index out of range (high)', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 10, 100, 150, 200, 255);
      }).toThrow('out of range');
    });

    it('TC3: Should fail when updating with negative color index', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', -1, 100, 150, 200, 255);
      }).toThrow('out of range');
    });

    it('TC4: Should fail when updating with red value out of range', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 256, 150, 200, 255);
      }).toThrow('between 0 and 255');
    });

    it('TC5: Should fail when updating with green value out of range', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 100, -1, 200, 255);
      }).toThrow('between 0 and 255');
    });

    it('TC6: Should fail when updating with blue value out of range', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 100, 150, 300, 255);
      }).toThrow('between 0 and 255');
    });

    it('TC7: Should fail when updating with alpha value out of range', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 100, 150, 200, -5);
      }).toThrow('between 0 and 255');
    });

    it('TC8: Should work with boundary RGBA values (all zeros)', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 0, 0, 0, 0);
      }).not.toThrow();
    });

    it('TC9: Should work with boundary RGBA values (all 255)', () => {
      expect(() => {
        fileService.updatePaletteColor(testUserName, 'palette-test.pixel', 0, 255, 255, 255, 255);
      }).not.toThrow();
    });
  });

  describe('Function 6: addColorToPalette() - Color Addition', () => {
    beforeEach(() => {
      fileService.createFile(testUserName, 'addcolor-test.pixel', 16, 16);
    });

    it('Should add a valid color to palette', () => {
      expect(() => {
        fileService.addColorToPalette(testUserName, 'addcolor-test.pixel', 255, 0, 0, 255);
      }).not.toThrow();
    });

    it('Should fail when adding color with invalid red value', () => {
      expect(() => {
        fileService.addColorToPalette(testUserName, 'addcolor-test.pixel', 256, 0, 0, 255);
      }).toThrow();
    });

    it('Should fail when adding color with non-existent file', () => {
      expect(() => {
        fileService.addColorToPalette(testUserName, 'nonexistent.pixel', 255, 0, 0, 255);
      }).toThrow('not found');
    });
  });

  describe('Function 7: Undo/Redo Operations', () => {
    beforeEach(() => {
      fileService.createFile(testUserName, 'undo-test.pixel', 16, 16);
      fileService.addColorToPalette(testUserName, 'undo-test.pixel', 255, 0, 0, 255);
      fileService.addColorToPalette(testUserName, 'undo-test.pixel', 0, 255, 0, 255);
    });

    it('Should undo operations', () => {
      expect(() => {
        fileService.undo(testUserName, 'undo-test.pixel');
      }).not.toThrow();
    });

    it('Should redo operations', () => {
      fileService.undo(testUserName, 'undo-test.pixel');
      expect(() => {
        fileService.redo(testUserName, 'undo-test.pixel');
      }).not.toThrow();
    });

    it('Should return true for canUndo when history available', () => {
      fileService.addColorToPalette(testUserName, 'undo-test.pixel', 0, 0, 255, 255);
      const canUndo = fileService.canUndo(testUserName, 'undo-test.pixel');
      expect(canUndo).toBe(true);
    });
  });

  describe('Function 8: File Deletion', () => {
    it('Should successfully delete an existing file', () => {
      fileService.createFile(testUserName, 'delete-test.pixel', 16, 16);
      expect(() => {
        fileService.deleteFile(testUserName, 'delete-test.pixel');
      }).not.toThrow();
    });

    it('Should fail when deleting non-existent file', () => {
      expect(() => {
        fileService.deleteFile(testUserName, 'nonexistent.pixel');
      }).toThrow('not found');
    });
  });
});
