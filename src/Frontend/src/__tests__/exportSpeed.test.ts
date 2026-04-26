import { exportModelAsPNG } from '../services/exportService';
import type { Model } from '../types';

// Mock URL.createObjectURL and related functions
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for canvas and links
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName: string) => {
  if (tagName === 'canvas') {
    const mockCanvasContext = {
      fillStyle: '',
      fillRect: jest.fn(),
    };
    return {
      getContext: jest.fn(() => mockCanvasContext),
      toBlob: jest.fn((callback: BlobCallback) => {
        callback(new Blob(['png'], { type: 'image/png' }));
      }),
    } as any;
  }
  return originalCreateElement.call(document, tagName);
});

describe('Export Speed (PNG)', () => {
  it('exports a 32x32 model as PNG in under 2 seconds', () => {
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
    exportModelAsPNG(model, 'testfile.png');
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });
});
