import React, { useState } from 'react';
import { PaletteColor } from '../../types';

interface PaletteProps {
  palette: PaletteColor[];
  selectedColorIndex: number;
  onColorSelect: (index: number) => void;
  onAddColor: (red: number, green: number, blue: number, alpha?: number) => void;
  onUpdateColor: (colorIndex: number, red: number, green: number, blue: number, alpha?: number) => void;
}

export const Palette: React.FC<PaletteProps> = ({
  palette,
  selectedColorIndex,
  onColorSelect,
  onAddColor,
  onUpdateColor
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'add' | 'update'>('add');
  const [selectedColor, setSelectedColor] = useState('#000000');

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

  const openAddColor = () => {
    setPickerMode('add');
    setSelectedColor('#000000');
    setShowColorPicker(true);
  };

  const openUpdateColor = () => {
    if (selectedColorIndex < 0 || selectedColorIndex >= palette.length) return;

    const selected = palette[selectedColorIndex];
    setPickerMode('update');
    setSelectedColor(rgbToHex(selected.red, selected.green, selected.blue));
    setShowColorPicker(true);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  const handleApplyColor = () => {
    const hex = selectedColor.replace('#', '');
    const red = parseInt(hex.substr(0, 2), 16);
    const green = parseInt(hex.substr(2, 2), 16);
    const blue = parseInt(hex.substr(4, 2), 16);

    if (pickerMode === 'add') {
      onAddColor(red, green, blue);
    } else {
      onUpdateColor(selectedColorIndex, red, green, blue);
    }

    setShowColorPicker(false);
  };

  return (
    <div className="palette-container">
      <h3>Palette</h3>
      <div className="palette-colors">
        {palette.map((color, index) => (
          <div
            key={index}
            className={`palette-color ${selectedColorIndex === index ? 'selected' : ''}`}
            style={{
              backgroundColor: `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})`,
              width: '40px',
              height: '40px',
              border: selectedColorIndex === index ? '3px solid #000' : '1px solid #ccc',
              cursor: 'pointer',
              display: 'inline-block',
              margin: '2px'
            }}
            onClick={() => onColorSelect(index)}
            title={`Color ${index}: rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})`}
          />
        ))}
      </div>
      
      {!showColorPicker ? (
        <div className="palette-actions">
          <button onClick={openAddColor} className="add-color-btn">
            Add Color
          </button>
          <button onClick={openUpdateColor} className="edit-color-btn" disabled={palette.length === 0}>
            Edit Selected Color
          </button>
        </div>
      ) : (
        <div className="color-picker">
          <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            style={{ marginRight: '10px' }}
          />
          <button onClick={handleApplyColor} className="add-color-confirm-btn">
            {pickerMode === 'add' ? 'Add' : 'Update'}
          </button>
          <button onClick={() => setShowColorPicker(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};