import { exportModelAsJSON } from '../services/exportService';
import type { Model } from '../types';

// Mock URL.createObjectURL and related functions
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();

describe('Export Speed (JSON)', () => {
  it('exports a 32x32 model as JSON in under 2 seconds', () => {
    // Create a simple 32x32 model
    const model: Model = {
      width: 32,
      height: 32,
      pixels: Array.from({ length: 32 }, () =>
        Array.from({ length: 32 }, () => ({ red: 100, green: 150, blue: 200, alpha: 255 }))
      ),
      palette: [
        {
          red: 100, green: 150, blue: 200, alpha: 255,
          pixels: []
        }
      ]
    };

    const start = performance.now();
    exportModelAsJSON(model, 'testfile.json');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });
});
