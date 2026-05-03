import { FileService } from '../src/services/FileService';
import fs from 'fs';
import path from 'path';

const TEST_DIR = path.join(__dirname, '../data/mc-dc-integration-tests');

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

describe('MC/DC Integration Tests - Full Workflow', () => {
  let fileService: FileService;
  let testUser: string;
  let testCounter = 0;

  beforeEach(() => {
    fileService = new FileService();
    testUser = `integration-test-user-${Date.now()}-${testCounter++}`;
    ensureTestDir();
  });

  afterEach(cleanupTestDir);

  describe('Create → Edit → Undo → Redo Workflow', () => {
    it('Should create file, add colors, recolor pixel, then undo/redo', () => {
      // Step 1: Create file
      const file = fileService.createFile(testUser, 'workflow.pixel', 8, 8);
      expect(file).toBeDefined();

      // Step 2: Add colors to palette
      fileService.addColorToPalette(testUser, 'workflow.pixel', 255, 0, 0, 255);
      fileService.addColorToPalette(testUser, 'workflow.pixel', 0, 255, 0, 255);

      // Step 3: Recolor some pixels
      fileService.recolorPixel(testUser, 'workflow.pixel', 0, 0, 1);
      fileService.recolorPixel(testUser, 'workflow.pixel', 1, 1, 1);

      // Step 4: Undo operations
      const undoResult1 = fileService.undo(testUser, 'workflow.pixel');
      expect(undoResult1).toBeDefined();

      const undoResult2 = fileService.undo(testUser, 'workflow.pixel');
      expect(undoResult2).toBeDefined();

      // Step 5: Redo operations
      const redoResult1 = fileService.redo(testUser, 'workflow.pixel');
      expect(redoResult1).toBeDefined();

      expect(fileService.canUndo(testUser, 'workflow.pixel')).toBe(true);
      expect(fileService.canRedo(testUser, 'workflow.pixel')).toBe(true);
    });

    it('Should handle file creation and palette manipulation sequence', () => {
      // Create a new file
      fileService.createFile(testUser, 'sequence.pixel', 10, 10);

      // Add multiple colors
      for (let i = 0; i < 5; i++) {
        fileService.addColorToPalette(testUser, 'sequence.pixel', i * 50, i * 40, i * 30, 255);
      }

      // Retrieve file and verify
      const file = fileService.getUserFile(testUser, 'sequence.pixel');
      expect(file).toBeDefined();
      expect(file?.current()).toBeDefined();
    });

    it('Should handle rapid color updates', () => {
      fileService.createFile(testUser, 'rapid-update.pixel', 10, 10);
      fileService.addColorToPalette(testUser, 'rapid-update.pixel', 255, 0, 0, 255);

      // Rapidly update the same color
      for (let i = 0; i < 5; i++) {
        fileService.updatePaletteColor(testUser, 'rapid-update.pixel', 0, 100 + i * 10, 150, 200, 255);
      }

      const file = fileService.getUserFile(testUser, 'rapid-update.pixel');
      expect(file?.current()).toBeDefined();
    });
  });

  describe('Pixel Operations with Palette Integration', () => {
    it('Should recolor multiple pixels and maintain consistency', () => {
      fileService.createFile(testUser, 'multi-pixel.pixel', 12, 12);
      fileService.addColorToPalette(testUser, 'multi-pixel.pixel', 100, 100, 100, 255);
      fileService.addColorToPalette(testUser, 'multi-pixel.pixel', 200, 200, 200, 255);

      // Recolor different pixels
      fileService.recolorPixel(testUser, 'multi-pixel.pixel', 0, 0, 0);
      fileService.recolorPixel(testUser, 'multi-pixel.pixel', 5, 5, 1);
      fileService.recolorPixel(testUser, 'multi-pixel.pixel', 11, 11, 1);

      const file = fileService.getUserFile(testUser, 'multi-pixel.pixel');
      expect(file?.current()).toBeDefined();
      expect(file?.current()?.pixels.length).toBe(12);
    });

    it('Should handle palette color cascading across pixels', () => {
      fileService.createFile(testUser, 'cascade.pixel', 8, 8);
      fileService.addColorToPalette(testUser, 'cascade.pixel', 50, 50, 50, 255);

      // Color multiple pixels with the same color
      fileService.recolorPixel(testUser, 'cascade.pixel', 0, 0, 0);
      fileService.recolorPixel(testUser, 'cascade.pixel', 1, 1, 0);
      fileService.recolorPixel(testUser, 'cascade.pixel', 2, 2, 0);

      // Update that color
      fileService.updatePaletteColor(testUser, 'cascade.pixel', 0, 150, 150, 150, 255);

      const file = fileService.getUserFile(testUser, 'cascade.pixel');
      expect(file?.current()).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('Should handle operations on non-existent file gracefully', () => {
      expect(() => {
        fileService.recolorPixel(testUser, 'doesnotexist.pixel', 0, 0, 0);
      }).toThrow('not found');

      expect(() => {
        fileService.updatePaletteColor(testUser, 'doesnotexist.pixel', 0, 255, 0, 0, 255);
      }).toThrow('not found');
    });

    it('Should prevent duplicate file creation', () => {
      fileService.createFile(testUser, 'duplicate.pixel', 10, 10);

      expect(() => {
        fileService.createFile(testUser, 'duplicate.pixel', 10, 10);
      }).toThrow('already exists');
    });

    it('Should validate dimensions on creation', () => {
      expect(() => fileService.createFile(testUser, 'bad-dims.pixel', 0, 10)).toThrow();
      expect(() => fileService.createFile(testUser, 'bad-dims.pixel', 10, 0)).toThrow();
      expect(() => fileService.createFile(testUser, 'bad-dims.pixel', -5, 10)).toThrow();
    });

    it('Should validate coordinates on pixel operations', () => {
      fileService.createFile(testUser, 'bounds.pixel', 10, 10);
      fileService.addColorToPalette(testUser, 'bounds.pixel', 255, 0, 0, 255);

      // Out of bounds X
      expect(() => fileService.recolorPixel(testUser, 'bounds.pixel', 10, 5, 0)).toThrow('out of bounds');

      // Out of bounds Y
      expect(() => fileService.recolorPixel(testUser, 'bounds.pixel', 5, 10, 0)).toThrow('out of bounds');

      // Negative coordinates
      expect(() => fileService.recolorPixel(testUser, 'bounds.pixel', -1, 5, 0)).toThrow('out of bounds');
      expect(() => fileService.recolorPixel(testUser, 'bounds.pixel', 5, -1, 0)).toThrow('out of bounds');
    });
  });

  describe('Boundary Conditions', () => {
    it('Should handle operations on corners and edges', () => {
      fileService.createFile(testUser, 'boundary.pixel', 32, 32);
      fileService.addColorToPalette(testUser, 'boundary.pixel', 100, 100, 100, 255);

      // Top-left corner
      fileService.recolorPixel(testUser, 'boundary.pixel', 0, 0, 0);

      // Top-right corner
      fileService.recolorPixel(testUser, 'boundary.pixel', 31, 0, 0);

      // Bottom-left corner
      fileService.recolorPixel(testUser, 'boundary.pixel', 0, 31, 0);

      // Bottom-right corner
      fileService.recolorPixel(testUser, 'boundary.pixel', 31, 31, 0);

      const file = fileService.getUserFile(testUser, 'boundary.pixel');
      expect(file?.current()).toBeDefined();
    });

    it('Should handle RGBA boundary values', () => {
      fileService.createFile(testUser, 'rgba-bounds.pixel', 8, 8);

      // Add color with minimum RGBA values
      fileService.addColorToPalette(testUser, 'rgba-bounds.pixel', 0, 0, 0, 0);

      // Update with maximum RGBA values
      fileService.updatePaletteColor(testUser, 'rgba-bounds.pixel', 0, 255, 255, 255, 255);

      const file = fileService.getUserFile(testUser, 'rgba-bounds.pixel');
      expect(file?.current()).toBeDefined();
    });

    it('Should handle many colors in palette', () => {
      fileService.createFile(testUser, 'many-colors.pixel', 16, 16);

      // Add many colors
      for (let i = 0; i < 20; i++) {
        fileService.addColorToPalette(testUser, 'many-colors.pixel', i * 12 % 256, i * 13 % 256, i * 14 % 256, 255);
      }

      // Recolor with different color indices
      fileService.recolorPixel(testUser, 'many-colors.pixel', 0, 0, 5);
      fileService.recolorPixel(testUser, 'many-colors.pixel', 8, 8, 15);
      fileService.recolorPixel(testUser, 'many-colors.pixel', 15, 15, 20);

      const file = fileService.getUserFile(testUser, 'many-colors.pixel');
      expect(file?.current()).toBeDefined();
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('Should maintain undo/redo state across operations', () => {
      fileService.createFile(testUser, 'undo-redo.pixel', 10, 10);
      fileService.addColorToPalette(testUser, 'undo-redo.pixel', 255, 0, 0, 255);
      fileService.addColorToPalette(testUser, 'undo-redo.pixel', 0, 255, 0, 255);
      fileService.recolorPixel(testUser, 'undo-redo.pixel', 0, 0, 1);

      // Track undo/redo availability
      const beforeUndo = fileService.canUndo(testUser, 'undo-redo.pixel');
      fileService.undo(testUser, 'undo-redo.pixel');
      const afterUndo = fileService.canRedo(testUser, 'undo-redo.pixel');

      expect(beforeUndo).toBe(true);
      expect(afterUndo).toBe(true);

      fileService.redo(testUser, 'undo-redo.pixel');
      const afterRedo = fileService.canUndo(testUser, 'undo-redo.pixel');
      expect(afterRedo).toBe(true);
    });

    it('Should clear redo history on new operation after undo', () => {
      fileService.createFile(testUser, 'redo-clear.pixel', 10, 10);
      fileService.addColorToPalette(testUser, 'redo-clear.pixel', 255, 0, 0, 255);
      fileService.addColorToPalette(testUser, 'redo-clear.pixel', 0, 255, 0, 255);

      // Undo and verify redo is available
      fileService.undo(testUser, 'redo-clear.pixel');
      expect(fileService.canRedo(testUser, 'redo-clear.pixel')).toBe(true);

      // Perform new operation
      fileService.addColorToPalette(testUser, 'redo-clear.pixel', 0, 0, 255, 255);

      // Redo should no longer be available
      expect(fileService.canRedo(testUser, 'redo-clear.pixel')).toBe(false);
    });
  });

  describe('File Deletion', () => {
    it('Should successfully delete files', () => {
      fileService.createFile(testUser, 'delete1.pixel', 10, 10);
      fileService.createFile(testUser, 'delete2.pixel', 10, 10);

      expect(() => fileService.deleteFile(testUser, 'delete1.pixel')).not.toThrow();

      // File should not be retrievable after deletion
      expect(() => fileService.recolorPixel(testUser, 'delete1.pixel', 0, 0, 0)).toThrow('not found');
    });

    it('Should fail when deleting non-existent file', () => {
      expect(() => fileService.deleteFile(testUser, 'nonexistent.pixel')).toThrow('not found');
    });
  });

  describe('Multi-user File Isolation', () => {
    it('Should maintain separate file spaces for different users', () => {
      const testUser2 = `integration-test-user-${Date.now()}-${testCounter++}`;

      // Create files for both users
      fileService.createFile(testUser, 'user1file.pixel', 10, 10);
      fileService.createFile(testUser2, 'user2file.pixel', 10, 10);

      // Add colors to user1's file
      fileService.addColorToPalette(testUser, 'user1file.pixel', 255, 0, 0, 255);

      // Add colors to user2's file
      fileService.addColorToPalette(testUser2, 'user2file.pixel', 0, 255, 0, 255);

      // Verify isolation
      expect(() => fileService.recolorPixel(testUser, 'user2file.pixel', 0, 0, 0)).toThrow('not found');
      expect(() => fileService.recolorPixel(testUser2, 'user1file.pixel', 0, 0, 0)).toThrow('not found');
    });
  });
});
