import { ResetFile } from '../src/models/ResetFile';
import type { Model } from '../src/models/Model';

const createTestModel = (width: number, height: number): Model => ({
  width,
  height,
  pixels: Array(height).fill(null).map(() => Array(width).fill({ r: 0, g: 0, b: 0, a: 255 })),
  palette: [{ r: 0, g: 0, b: 0, a: 255 }],
});

describe('MC/DC Coverage - Function 2: ResetFile.undo()', () => {
  let file: ResetFile;

  beforeEach(() => {
    file = new ResetFile('test.pixel');
  });

  describe('TC1: C1=F - Cannot undo at history start', () => {
    it('should return undefined when at beginning of history (currentIndex = 0)', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const result = file.undo();

      expect(result).toBeUndefined();
    });

    it('should not decrement currentIndex when already at start', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const indexBefore = (file as any).currentIndex;
      file.undo();
      const indexAfter = (file as any).currentIndex;

      expect(indexAfter).toBe(indexBefore);
    });

    it('should maintain history integrity when undo called at start', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const initialHistory = [...(file as any).history];
      file.undo();
      const finalHistory = [...(file as any).history];

      expect(finalHistory.length).toBe(initialHistory.length);
    });
  });

  describe('TC2: C1=T - Undo available when currentIndex > 0', () => {
    it('should return previous model when undo available', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);

      const result = file.undo();

      expect(result).toBeDefined();
      expect(result?.width).toBe(32);
    });

    it('should decrement currentIndex when undo successful', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);

      const indexBefore = (file as any).currentIndex;
      file.undo();
      const indexAfter = (file as any).currentIndex;

      expect(indexAfter).toBe(indexBefore - 1);
    });

    it('should allow multiple undo operations', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);
      const model3 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);
      file.push(model3);

      file.undo();
      file.undo();

      expect((file as any).currentIndex).toBe(0);
    });

    it('should return correct model in middle of history', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(64, 64);
      const model3 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);
      file.push(model3);

      file.undo();
      const result = file.undo();

      expect(result?.width).toBe(32);
      expect(result?.height).toBe(32);
    });

    it('should allow undo then continue editing without affecting history before undo point', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);
      const model3 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);
      file.push(model3);

      file.undo();
      file.push(createTestModel(48, 48));

      expect((file as any).history.length).toBe(3);
    });
  });

  describe('Edge Cases: Undo boundary conditions', () => {
    it('should handle undo with single model in history', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const result = file.undo();

      expect(result).toBeUndefined();
    });

    it('should handle undo after multiple operations', () => {
      for (let i = 0; i < 10; i++) {
        file.push(createTestModel(32, 32));
      }

      for (let i = 0; i < 9; i++) {
        file.undo();
      }

      expect((file as any).currentIndex).toBe(0);
    });
  });
});

describe('MC/DC Coverage - Function 3: ResetFile.redo()', () => {
  let file: ResetFile;

  beforeEach(() => {
    file = new ResetFile('test.pixel');
  });

  describe('TC1: C1=F - Cannot redo at history end', () => {
    it('should return undefined when at end of history', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const result = file.redo();

      expect(result).toBeUndefined();
    });

    it('should not increment currentIndex when already at end', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const indexBefore = (file as any).currentIndex;
      file.redo();
      const indexAfter = (file as any).currentIndex;

      expect(indexAfter).toBe(indexBefore);
    });

    it('should maintain history integrity when redo called at end', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const initialHistory = [...(file as any).history];
      file.redo();
      const finalHistory = [...(file as any).history];

      expect(finalHistory.length).toBe(initialHistory.length);
    });
  });

  describe('TC2: C1=T - Redo available when currentIndex < history.length - 1', () => {
    it('should return next model when redo available', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(64, 64);

      file.push(model1);
      file.push(model2);
      file.undo();

      const result = file.redo();

      expect(result).toBeDefined();
      expect(result?.width).toBe(64);
    });

    it('should increment currentIndex when redo successful', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);
      file.undo();

      const indexBefore = (file as any).currentIndex;
      file.redo();
      const indexAfter = (file as any).currentIndex;

      expect(indexAfter).toBe(indexBefore + 1);
    });

    it('should allow multiple redo operations', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);
      const model3 = createTestModel(32, 32);

      file.push(model1);
      file.push(model2);
      file.push(model3);

      file.undo();
      file.undo();
      file.redo();
      file.redo();

      expect((file as any).currentIndex).toBe(2);
    });

    it('should return correct model after multiple undos and redos', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(64, 64);
      const model3 = createTestModel(48, 48);

      file.push(model1);
      file.push(model2);
      file.push(model3);

      file.undo();
      file.undo();
      file.redo();

      const result = (file as any).history[(file as any).currentIndex];

      expect(result?.width).toBe(64);
    });

    it('should discard redo history when new edit after undo', () => {
      const model1 = createTestModel(32, 32);
      const model2 = createTestModel(32, 32);
      const model3 = createTestModel(48, 48);

      file.push(model1);
      file.push(model2);
      file.undo();
      file.push(model3);

      const canRedo = file.redo();

      expect(canRedo).toBeUndefined();
    });
  });

  describe('Edge Cases: Redo boundary conditions', () => {
    it('should handle redo with single model in history', () => {
      const model = createTestModel(32, 32);
      file.push(model);

      const result = file.redo();

      expect(result).toBeUndefined();
    });

    it('should handle redo after multiple undo operations', () => {
      for (let i = 0; i < 10; i++) {
        file.push(createTestModel(32, 32));
      }

      for (let i = 0; i < 9; i++) {
        file.undo();
      }

      for (let i = 0; i < 5; i++) {
        file.redo();
      }

      expect((file as any).currentIndex).toBe(5);
    });
  });
});
