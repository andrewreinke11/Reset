import { useRef, useEffect, useState } from 'react';
import { Model } from '../../types';

interface CanvasProps {
  model: Model;
  onPixelClick: (x: number, y: number) => void;
  selectedColorIndex: number;
}

export const Canvas: React.FC<CanvasProps> = ({ model, onPixelClick, selectedColorIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixelSize, setPixelSize] = useState(20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = model.width * pixelSize;
    canvas.height = model.height * pixelSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < model.height; y++) {
      for (let x = 0; x < model.width; x++) {
        const pixel = model.pixels[y][x];
        ctx.fillStyle = `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${pixel.alpha / 255})`;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }, [model, pixelSize]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < model.width && y >= 0 && y < model.height) {
      onPixelClick(x, y);
    }
  };

  return (
    <div className="canvas-container">
      <div className="canvas-controls">
        <label>
          Pixel Size:
          <input
            type="range"
            min="5"
            max="50"
            value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
          />
          {pixelSize}px
        </label>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
      />
      <div className="canvas-info">
        Selected Color: {selectedColorIndex !== -1 ? `Palette[${selectedColorIndex}]` : 'None'}
      </div>
    </div>
  );
};